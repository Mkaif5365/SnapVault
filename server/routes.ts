import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertPhotoSchema } from "@shared/schema";
import express, { Request, Response } from "express";
import { IStorage } from "./storage";
import { userSignupSchema, userLoginSchema, userRegistrationSchema } from "@shared/schema";
import { registerUser, loginUser, authenticate } from "./auth";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(app: express.Express) {
  const router = express.Router();
  const storage = app.get("storage") as IStorage;

  // Authentication routes
  router.post("/auth/signup", async (req: Request, res: Response) => {
    try {
      const userData = userSignupSchema.parse(req.body);
      const result = await registerUser(storage, userData);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const credentials = userLoginSchema.parse(req.body);
      const result = await loginUser(storage, credentials);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Get current user
  router.get("/auth/me", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password hash
      const { passwordHash, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's events
  router.get("/auth/events", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const events = await storage.getUserEvents(userId);
      res.status(200).json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Events routes
  router.get("/events", async (req: Request, res: Response) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  router.get("/events/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const event = await storage.getEvent(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json(event);
  });

  router.post("/events", async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Protected route to create an event (requires authentication)
  router.post("/auth/events", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        hostId: userId,
        hostName: user.name
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete an event (requires authentication)
  router.delete("/events/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the event
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if the user is the owner of the event
      if (event.hostId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this event" });
      }
      
      // Delete the event
      await storage.deleteEvent(eventId);
      
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/events/:id/photos", async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.id);
    const photos = await storage.getEventPhotos(eventId);
    res.json(photos);
  });

  router.post("/photos", async (req: Request, res: Response) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(photoData);
      res.status(201).json(photo);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/events/:id/register", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const { userName } = userRegistrationSchema.parse({
        ...req.body,
        eventId
      });
      
      const userId = uuidv4();
      
      res.status(200).json({
        userId,
        userName,
        eventId
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
