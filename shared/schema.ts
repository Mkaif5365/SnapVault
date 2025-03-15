import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  hostId: text("host_id").references(() => users.id),
  hostName: text("host_name"),
  photoLimit: integer("photo_limit").notNull().default(3),
  revealDelay: integer("reveal_delay").notNull().default(300), // Minutes
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
  active: integer("active", { mode: "boolean" }).notNull().default(true)
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  userId: text("user_id"),
  userName: text("user_name"),
  imageUrl: text("image_url").notNull(),
  filter: text("filter"),
  takenAt: integer("taken_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  passwordHash: true,
  name: true
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const userSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required")
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  description: true,
  hostId: true,
  hostName: true,
  photoLimit: true,
  revealDelay: true
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  eventId: true,
  userId: true,
  userName: true,
  imageUrl: true,
  filter: true
});

export const userRegistrationSchema = z.object({
  eventId: z.number(),
  userName: z.string().min(1, "Name is required")
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserSignup = z.infer<typeof userSignupSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
