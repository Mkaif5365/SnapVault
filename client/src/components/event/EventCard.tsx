import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Calendar, Camera, Clock } from "lucide-react";
import type { Event } from "@shared/schema";

interface Props {
  event: Event;
}

export default function EventCard({ event }: Props) {
  const isPhotoRevealed = (createdAt: Date) => {
    const revealTime = new Date(createdAt.getTime() + event.revealDelay * 60 * 1000);
    return new Date() >= revealTime;
  };

  return (
    <Link href={`/event/${event.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="overflow-hidden backdrop-blur-sm bg-card/80 border-primary/10 hover:border-primary/20 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg font-semibold">{event.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {event.description || "No description provided"}
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Camera className="w-4 h-4 mr-2" />
                <span>Photo Limit: {event.photoLimit}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                <span>Reveal After: {event.revealDelay} minutes</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Created: {new Date(event.createdAt!).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}