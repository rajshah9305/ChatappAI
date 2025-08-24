import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

// Updated schema with proper indexing and relations
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  settings: jsonb("settings").default({})
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").default({})
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").default({})
});
