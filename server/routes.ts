import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertPhotoSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(parseInt(req.params.id));
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  });

  app.post("/api/events", async (req, res) => {
    const parsed = insertEventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid event data" });
      return;
    }
    const event = await storage.createEvent(parsed.data);
    res.json(event);
  });

  app.get("/api/events/:id/photos", async (req, res) => {
    const photos = await storage.getEventPhotos(parseInt(req.params.id));
    res.json(photos);
  });

  app.post("/api/photos", async (req, res) => {
    const parsed = insertPhotoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid photo data" });
      return;
    }
    const photo = await storage.createPhoto(parsed.data);
    res.json(photo);
  });

  const httpServer = createServer(app);
  return httpServer;
}
