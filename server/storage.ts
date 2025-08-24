import { type User, type InsertUser, type Conversation, type InsertConversation, type Message, type InsertMessage, type ApiKey, type InsertApiKey, type AIProviderType } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Conversation methods
  getConversationsByUserId(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;

  // Message methods
  getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessagesByConversationId(conversationId: string): Promise<boolean>;

  // API Key methods
  getApiKeysByUserId(userId: string): Promise<ApiKey[]>;
  getApiKey(userId: string, provider: AIProviderType): Promise<ApiKey | undefined>;
  setApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(userId: string, provider: AIProviderType): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Conversation methods
  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const newConv: Conversation = { 
      ...conversation, 
      id, 
      userId: conversation.userId || null,
      createdAt: now, 
      updatedAt: now 
    };
    this.conversations.set(id, newConv);
    return newConv;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;
    
    const updated: Conversation = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<boolean> {
    // Delete associated messages first
    await this.deleteMessagesByConversationId(id);
    return this.conversations.delete(id);
  }

  // Message methods
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = { 
      ...message, 
      id, 
      metadata: message.metadata || null,
      createdAt: new Date() 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId);
    
    messagesToDelete.forEach(msg => this.messages.delete(msg.id));
    return true;
  }

  // API Key methods
  async getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(key => key.userId === userId);
  }

  async getApiKey(userId: string, provider: AIProviderType): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values())
      .find(key => key.userId === userId && key.provider === provider && key.isActive);
  }

  async setApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    // Deactivate existing keys for this provider/user
    Array.from(this.apiKeys.values())
      .filter(key => key.userId === apiKey.userId && key.provider === apiKey.provider)
      .forEach(key => {
        key.isActive = false;
        this.apiKeys.set(key.id, key);
      });

    // Create new active key
    const id = randomUUID();
    const newKey: ApiKey = { 
      ...apiKey, 
      id, 
      isActive: true,
      createdAt: new Date() 
    };
    this.apiKeys.set(id, newKey);
    return newKey;
  }

  async deleteApiKey(userId: string, provider: AIProviderType): Promise<boolean> {
    const key = await this.getApiKey(userId, provider);
    if (key) {
      return this.apiKeys.delete(key.id);
    }
    return false;
  }
}

export const storage = new MemStorage();
