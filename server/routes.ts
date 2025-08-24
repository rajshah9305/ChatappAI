import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiProviderService } from "./services/ai-providers";
import { insertConversationSchema, insertMessageSchema, insertApiKeySchema, AIProvider, AIProviderType, ChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user authentication - in production, use proper auth
  const mockUserId = "user-1";
  
  // Get conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversationsByUserId(mockUserId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Create conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        userId: mockUserId
      });
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: "Invalid conversation data" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation || conversation.userId !== mockUserId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversationId(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation || conversation.userId !== mockUserId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messageData = ChatMessageSchema.parse(req.body);
      
      // Get API key for the provider
      const apiKey = await storage.getApiKey(mockUserId, conversation.provider as AIProviderType);
      if (!apiKey) {
        return res.status(400).json({ error: `API key not configured for ${conversation.provider}` });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId: id,
        role: 'user',
        content: messageData.content,
        metadata: messageData.images ? { images: messageData.images } : null
      });

      // Get conversation history
      const messages = await storage.getMessagesByConversationId(id);
      const chatHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        images: (msg.metadata as any)?.images as string[] | undefined
      }));

      // Send to AI provider
      const aiResponse = await aiProviderService.sendMessage(
        conversation.provider as AIProviderType,
        apiKey.keyValue,
        chatHistory,
        conversation.model
      );

      // Save AI response
      const assistantMessage = await storage.createMessage({
        conversationId: id,
        role: 'assistant',
        content: aiResponse.content,
        metadata: { usage: aiResponse.usage }
      });

      // Update conversation timestamp
      await storage.updateConversation(id, { updatedAt: new Date() });

      res.json({ userMessage, assistantMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation || conversation.userId !== mockUserId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      await storage.deleteConversation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Update conversation
  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, provider, model } = req.body;
      
      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.userId !== mockUserId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const updates: any = {};
      if (title) updates.title = title;
      if (provider) {
        AIProvider.parse(provider);
        updates.provider = provider;
      }
      if (model) updates.model = model;

      const updated = await storage.updateConversation(id, updates);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Get API keys
  app.get("/api/api-keys", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeysByUserId(mockUserId);
      // Don't expose the actual key values
      const sanitizedKeys = apiKeys.map(key => ({
        ...key,
        keyValue: key.keyValue.substring(0, 8) + '••••••••••••••••••••••••••••••••••••••••'
      }));
      res.json(sanitizedKeys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  // Set API key
  app.post("/api/api-keys", async (req, res) => {
    try {
      const validatedData = insertApiKeySchema.parse({
        ...req.body,
        userId: mockUserId
      });
      
      const apiKey = await storage.setApiKey(validatedData);
      
      // Don't expose the actual key value in response
      res.json({
        ...apiKey,
        keyValue: apiKey.keyValue.substring(0, 8) + '••••••••••••••••••••••••••••••••••••••••'
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid API key data" });
    }
  });

  // Delete API key
  app.delete("/api/api-keys/:provider", async (req, res) => {
    try {
      const provider = AIProvider.parse(req.params.provider);
      await storage.deleteApiKey(mockUserId, provider);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid provider" });
    }
  });

  // Get available models for a provider
  app.get("/api/providers/:provider/models", (req, res) => {
    try {
      const provider = AIProvider.parse(req.params.provider);
      const models = aiProviderService.getAvailableModels(provider);
      res.json({ models });
    } catch (error) {
      res.status(400).json({ error: "Invalid provider" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
