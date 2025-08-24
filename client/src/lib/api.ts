import { apiRequest } from "./queryClient";
import type { Conversation, Message, ApiKey, AIProviderType } from "@shared/schema";

export const api = {
  // Conversations
  conversations: {
    list: (): Promise<Conversation[]> => 
      apiRequest('GET', '/api/conversations').then(res => res.json()),
    
    get: (id: string): Promise<Conversation> => 
      apiRequest('GET', `/api/conversations/${id}`).then(res => res.json()),
    
    create: (data: { title: string; provider: AIProviderType; model: string }): Promise<Conversation> => 
      apiRequest('POST', '/api/conversations', data).then(res => res.json()),
    
    update: (id: string, data: Partial<Conversation>): Promise<Conversation> => 
      apiRequest('PATCH', `/api/conversations/${id}`, data).then(res => res.json()),
    
    delete: (id: string): Promise<{ success: boolean }> => 
      apiRequest('DELETE', `/api/conversations/${id}`).then(res => res.json()),
  },

  // Messages
  messages: {
    list: (conversationId: string): Promise<Message[]> => 
      apiRequest('GET', `/api/conversations/${conversationId}/messages`).then(res => res.json()),
    
    send: (conversationId: string, data: { content: string; images?: string[] }): Promise<{ userMessage: Message; assistantMessage: Message }> => 
      apiRequest('POST', `/api/conversations/${conversationId}/messages`, data).then(res => res.json()),
  },

  // API Keys
  apiKeys: {
    list: (): Promise<ApiKey[]> => 
      apiRequest('GET', '/api/api-keys').then(res => res.json()),
    
    set: (data: { provider: AIProviderType; keyValue: string }): Promise<ApiKey> => 
      apiRequest('POST', '/api/api-keys', data).then(res => res.json()),
    
    delete: (provider: AIProviderType): Promise<{ success: boolean }> => 
      apiRequest('DELETE', `/api/api-keys/${provider}`).then(res => res.json()),
  },

  // Providers
  providers: {
    getModels: (provider: AIProviderType): Promise<{ models: string[] }> => 
      apiRequest('GET', `/api/providers/${provider}/models`).then(res => res.json()),
  }
};
