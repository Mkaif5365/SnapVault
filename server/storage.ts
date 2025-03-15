import type { Event, InsertEvent, Photo, InsertPhoto, User, InsertUser } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { events, photos, users } from "../shared/schema";

export interface IStorage {
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  getEventPhotos(eventId: number): Promise<Photo[]>;
  getUserEventPhotos(eventId: number, userId: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // User methods
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserEvents(userId: string): Promise<Event[]>;
}

export class SqliteStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sqlite = new Database("sqlite.db");
    this.db = drizzle(sqlite);
  }

  async getEvents(): Promise<Event[]> {
    return this.db.select().from(events).all();
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.db.select().from(events).where(eq(events.id, id)).get();
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await this.db.insert(events).values(event).returning().get();
    return result;
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      // First delete all photos associated with the event
      await this.db.delete(photos).where(eq(photos.eventId, id));
      
      // Then delete the event itself
      const result = await this.db.delete(events).where(eq(events.id, id)).returning().get();
      
      return result !== undefined;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  async getEventPhotos(eventId: number): Promise<Photo[]> {
    return this.db.select().from(photos).where(eq(photos.eventId, eventId)).all();
  }

  async getUserEventPhotos(eventId: number, userId: string): Promise<Photo[]> {
    return this.db
      .select()
      .from(photos)
      .where(and(eq(photos.eventId, eventId), eq(photos.userId, userId)))
      .all();
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const result = await this.db.insert(photos).values(photo).returning().get();
    return result;
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.db.select().from(users).where(eq(users.email, email)).get();
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.db.select().from(users).where(eq(users.id, id)).get();
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning().get();
    return result;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return this.db.select().from(events).where(eq(events.hostId, userId)).all();
  }
}

export const storage = new SqliteStorage();