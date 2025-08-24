import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  userId: varchar("user_id").references(() => users.id),
  provider: text("provider").notNull(), // 'openai' | 'anthropic' | 'google'
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // For storing additional info like images, timestamps, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // 'openai' | 'anthropic' | 'google'
  keyValue: text("key_value").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export const AIProvider = z.enum(['openai', 'anthropic', 'google', 'huggingface', 'cerebras', 'sambanova', 'mistral', 'cohere', 'xai', 'perplexity', 'together', 'fireworks']);
export type AIProviderType = z.infer<typeof AIProvider>;

export const ChatMessageSchema = z.object({
  content: z.string(),
  images: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    type: z.enum(['pdf', 'doc', 'txt']),
    name: z.string(),
    content: z.string()
  })).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const chatTemplates = [
  {
    id: 'creative-writing',
    name: '✍️ Creative Writing',
    description: 'Generate creative stories, poems, and narratives',
    prompt: 'You are a creative writing assistant. Help me write engaging and imaginative content. Focus on vivid descriptions, compelling characters, and interesting plot developments.',
    category: 'Writing'
  },
  {
    id: 'code-review',
    name: '👨‍💻 Code Review',
    description: 'Review and improve code quality',
    prompt: 'You are an expert code reviewer. Analyze the provided code for bugs, performance issues, security vulnerabilities, and suggest improvements. Provide specific feedback with examples.',
    category: 'Programming'
  },
  {
    id: 'business-analysis',
    name: '📊 Business Analysis',
    description: 'Analyze business problems and strategies',
    prompt: 'You are a business analyst. Help analyze business problems, identify opportunities, and suggest strategic solutions. Focus on data-driven insights and practical recommendations.',
    category: 'Business'
  },
  {
    id: 'learning-tutor',
    name: '🎓 Learning Tutor',
    description: 'Personalized learning and explanations',
    prompt: 'You are a patient and knowledgeable tutor. Break down complex topics into easy-to-understand explanations. Use examples, analogies, and step-by-step reasoning.',
    category: 'Education'
  },
  {
    id: 'research-assistant',
    name: '🔬 Research Assistant',
    description: 'Help with research and fact-finding',
    prompt: 'You are a research assistant. Help gather information, analyze sources, and synthesize findings. Provide well-structured research with citations and key insights.',
    category: 'Research'
  },
  {
    id: 'creative-problem-solving',
    name: '💡 Creative Problem Solver',
    description: 'Innovative solutions to complex problems',
    prompt: 'You are a creative problem-solving expert. Think outside the box to find innovative solutions. Use lateral thinking, brainstorming techniques, and unconventional approaches.',
    category: 'Innovation'
  }
];
