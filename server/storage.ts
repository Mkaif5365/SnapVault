import type { Event, InsertEvent, Photo, InsertPhoto } from "@shared/schema";

export interface IStorage {
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getEventPhotos(eventId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
}

export class MemStorage implements IStorage {
  private events: Map<number, Event>;
  private photos: Map<number, Photo>;
  private eventId: number;
  private photoId: number;

  constructor() {
    this.events = new Map();
    this.photos = new Map();
    this.eventId = 1;
    this.photoId = 1;
  }

  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const event: Event = {
      id,
      name: insertEvent.name,
      description: insertEvent.description ?? null,
      photoLimit: insertEvent.photoLimit ?? 5,
      revealDelay: insertEvent.revealDelay ?? 24,
      createdAt: new Date(),
      active: true
    };
    this.events.set(id, event);
    return event;
  }

  async getEventPhotos(eventId: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(
      photo => photo.eventId === eventId
    );
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoId++;
    const photo: Photo = {
      id,
      eventId: insertPhoto.eventId,
      imageUrl: insertPhoto.imageUrl,
      filter: insertPhoto.filter ?? null,
      takenAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }
}

export const storage = new MemStorage();