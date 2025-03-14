import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { Calendar, Camera, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Event } from "@shared/schema";

interface Props {
  event: Event;
  onDelete?: (eventId: number) => void;
}

export default function EventCard({ event, onDelete }: Props) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const isPhotoRevealed = (createdAt: Date) => {
    const revealTime = new Date(createdAt.getTime() + event.revealDelay * 60 * 1000);
    return new Date() >= revealTime;
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to event details
    e.stopPropagation(); // Stop event propagation
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(event.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
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
            {onDelete && (
              <CardFooter className="pt-0 justify-end">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteClick}
                  className="mt-2"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{event.name}" and all associated photos.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}