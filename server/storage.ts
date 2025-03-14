import type { Event, InsertEvent, Photo, InsertPhoto } from "@shared/schema";
import { db } from "./db";
import { events, photos } from "../shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  getEventPhotos(eventId: number): Promise<Photo[]>;
  getUserEventPhotos(eventId: number, userId: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
}

export class SqliteStorage implements IStorage {
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.createdAt);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values({
      name: insertEvent.name,
      description: insertEvent.description ?? null,
      hostId: insertEvent.hostId ?? null,
      hostName: insertEvent.hostName ?? null,
      photoLimit: insertEvent.photoLimit ?? 5,
      revealDelay: insertEvent.revealDelay ?? 24,
      createdAt: new Date(),
      active: true
    }).returning();
    
    return result[0];
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      // First delete all photos associated with the event
      await db.delete(photos).where(eq(photos.eventId, id));
      
      // Then delete the event itself
      const result = await db.delete(events).where(eq(events.id, id)).returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting event:", error);
      return false;
    }
  }

  async getEventPhotos(eventId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.eventId, eventId));
  }

  async getUserEventPhotos(eventId: number, userId: string): Promise<Photo[]> {
    return await db.select().from(photos).where(
      and(
        eq(photos.eventId, eventId),
        eq(photos.userId, userId)
      )
    );
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const result = await db.insert(photos).values({
      eventId: insertPhoto.eventId,
      userId: insertPhoto.userId ?? null,
      userName: insertPhoto.userName ?? null,
      imageUrl: insertPhoto.imageUrl,
      filter: insertPhoto.filter ?? null,
      takenAt: new Date()
    }).returning();
    
    return result[0];
  }
}

export const storage = new SqliteStorage();