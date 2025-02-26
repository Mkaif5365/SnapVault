import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  photoLimit: integer("photo_limit").notNull().default(3),
  revealDelay: integer("reveal_delay").notNull().default(5), // Hours
  createdAt: timestamp("created_at").defaultNow(),
  active: boolean("active").default(true)
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  imageUrl: text("image_url").notNull(),
  filter: text("filter"),
  takenAt: timestamp("taken_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  name: true,
  description: true,
  photoLimit: true,
  revealDelay: true
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  eventId: true,
  imageUrl: true,
  filter: true
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
