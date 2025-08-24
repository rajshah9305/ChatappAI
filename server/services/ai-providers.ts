import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";
import { HfInference } from "@huggingface/inference";
import { Mistral } from "@mistralai/mistralai";
import { CohereClient } from "cohere-ai";
import { type AIProviderType, type ChatMessage } from "@shared/schema";

/*
<important_code_snippet_instructions>
The newest OpenAI model is "gpt-4o", not "gpt-4". gpt-4o was released after the knowledge cutoff. Always prefer using gpt-4o as it is the latest model.
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229".
The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
</important_code_snippet_instructions>
*/

// Default models for each provider
const DEFAULT_MODELS = {
  openai: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  anthropic: "claude-sonnet-4-20250514", // claude-sonnet-4-20250514
  google: "gemini-2.5-flash",
  huggingface: "meta-llama/Llama-3.2-11B-Vision-Instruct",
  cerebras: "llama3.1-8b",
  sambanova: "Meta-Llama-3.1-8B-Instruct",
  mistral: "mistral-large-latest",
  cohere: "command-r-plus",
  xai: "grok-beta",
  perplexity: "llama-3.1-sonar-large-128k-online",
  together: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  fireworks: "accounts/fireworks/models/llama-v3p1-8b-instruct"
};

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProviderType;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIProviderService {
  async sendMessage(
    provider: AIProviderType,
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model?: string
  ): Promise<AIResponse> {
    const selectedModel = model || DEFAULT_MODELS[provider];

    switch (provider) {
      case 'openai':
        return this.sendOpenAIMessage(apiKey, messages, selectedModel);
      case 'anthropic':
        return this.sendAnthropicMessage(apiKey, messages, selectedModel);
      case 'google':
        return this.sendGoogleMessage(apiKey, messages, selectedModel);
      case 'huggingface':
        return this.sendHuggingFaceMessage(apiKey, messages, selectedModel);
      case 'cerebras':
        return this.sendCerebrasMessage(apiKey, messages, selectedModel);
      case 'sambanova':
        return this.sendSambanovaMessage(apiKey, messages, selectedModel);
      case 'mistral':
        return this.sendMistralMessage(apiKey, messages, selectedModel);
      case 'cohere':
        return this.sendCohereMessage(apiKey, messages, selectedModel);
      case 'xai':
        return this.sendXAIMessage(apiKey, messages, selectedModel);
      case 'perplexity':
        return this.sendPerplexityMessage(apiKey, messages, selectedModel);
      case 'together':
        return this.sendTogetherMessage(apiKey, messages, selectedModel);
      case 'fireworks':
        return this.sendFireworksMessage(apiKey, messages, selectedModel);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private async sendOpenAIMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    const openai = new OpenAI({ apiKey });

    const openaiMessages = messages.map(msg => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            ...msg.images.map(img => ({
              type: "image_url" as const,
              image_url: { url: `data:image/jpeg;base64,${img}` }
            }))
          ]
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 4000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'openai',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendAnthropicMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    const anthropic = new Anthropic({ apiKey });

    const anthropicMessages = messages.map(msg => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: "text", text: msg.content },
            ...msg.images.map(img => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: "image/jpeg" as const,
                data: img
              }
            }))
          ]
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const response = await anthropic.messages.create({
      model, // claude-sonnet-4-20250514
      max_tokens: 4000,
      messages: anthropicMessages as any,
    });

    return {
      content: Array.isArray(response.content) 
        ? response.content.map(c => c.type === 'text' ? c.text : '').join('')
        : response.content,
      model,
      provider: 'anthropic',
      usage: response.usage ? {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      } : undefined
    };
  }

  private async sendGoogleMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    const genai = new GoogleGenAI({ apiKey });

    // Convert messages to Gemini format
    const contents = messages.map(msg => {
      const parts: any[] = [{ text: msg.content }];
      
      if (msg.images && msg.images.length > 0) {
        msg.images.forEach(img => {
          parts.push({
            inlineData: {
              data: img,
              mimeType: "image/jpeg"
            }
          });
        });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    const response = await genai.models.generateContent({
      model,
      contents,
    });

    return {
      content: response.text || "",
      model,
      provider: 'google'
    };
  }

  private async sendHuggingFaceMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    const hf = new HfInference(apiKey);

    // Convert messages to Hugging Face format
    const conversationText = messages.map(msg => {
      if (msg.role === 'user') {
        return `Human: ${msg.content}`;
      } else {
        return `Assistant: ${msg.content}`;
      }
    }).join('\n') + '\nAssistant:';

    const response = await hf.textGeneration({
      model,
      inputs: conversationText,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
      },
    });

    return {
      content: response.generated_text.replace(conversationText, '').trim(),
      model,
      provider: 'huggingface'
    };
  }

  private async sendCerebrasMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    // Cerebras uses OpenAI-compatible API
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.cerebras.ai/v1'
    });

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'cerebras',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendSambanovaMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    // SambaNova uses OpenAI-compatible API
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.sambanova.ai/v1'
    });

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'sambanova',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendMistralMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    const mistral = new Mistral({ apiKey });

    const mistralMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await mistral.chat.complete({
      model,
      messages: mistralMessages,
    });

    return {
      content: response.choices?.[0]?.message?.content || "",
      model,
      provider: 'mistral',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendCohereMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    const cohere = new CohereClient({ token: apiKey });

    // Convert messages to Cohere format
    const lastMessage = messages[messages.length - 1];
    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'USER' as const : 'CHATBOT' as const,
      message: msg.content
    }));

    const response = await cohere.chat({
      model,
      message: lastMessage.content,
      chatHistory: chatHistory.length > 0 ? chatHistory : undefined,
    });

    return {
      content: response.text || "",
      model,
      provider: 'cohere'
    };
  }

  private async sendXAIMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    // xAI uses OpenAI-compatible API
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.x.ai/v1'
    });

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'xai',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendPerplexityMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    // Perplexity uses OpenAI-compatible API
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.perplexity.ai'
    });

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'perplexity',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendTogetherMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    // Together AI uses OpenAI-compatible API
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.together.xyz/v1'
    });

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'together',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  private async sendFireworksMessage(
    apiKey: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string; images?: string[] }>,
    model: string
  ): Promise<AIResponse> {
    // Fireworks AI uses OpenAI-compatible API
    const openai = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.fireworks.ai/inference/v1'
    });

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await openai.chat.completions.create({
      model,
      messages: openaiMessages as any,
      max_tokens: 1000,
    });

    return {
      content: response.choices[0].message.content || "",
      model,
      provider: 'fireworks',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined
    };
  }

  getAvailableModels(provider: AIProviderType): string[] {
    switch (provider) {
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
      case 'anthropic':
        return ['claude-sonnet-4-20250514', 'claude-3-7-sonnet-20250219', 'claude-3-haiku-20240307'];
      case 'google':
        return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash'];
      case 'huggingface':
        return ['meta-llama/Llama-3.2-11B-Vision-Instruct', 'meta-llama/Llama-3.1-8B-Instruct', 'microsoft/DialoGPT-medium'];
      case 'cerebras':
        return ['llama3.1-8b', 'llama3.1-70b'];
      case 'sambanova':
        return ['Meta-Llama-3.1-8B-Instruct', 'Meta-Llama-3.1-70B-Instruct'];
      case 'mistral':
        return ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest'];
      case 'cohere':
        return ['command-r-plus', 'command-r', 'command-light'];
      case 'xai':
        return ['grok-beta', 'grok-vision-beta'];
      case 'perplexity':
        return ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-huge-128k-online'];
      case 'together':
        return ['meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', 'microsoft/WizardLM-2-8x22B'];
      case 'fireworks':
        return ['accounts/fireworks/models/llama-v3p1-8b-instruct', 'accounts/fireworks/models/mixtral-8x7b-instruct', 'accounts/fireworks/models/yi-large'];
      default:
        return [];
    }
  }
}

export const aiProviderService = new AIProviderService();
