import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PlusCircle, Calendar, Users, Clock, Trash2 } from "lucide-react";
import type { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/layout/Layout";
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

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoggedIn, userName, logout } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn && !isRedirecting) {
      setIsRedirecting(true);
      navigate("/login");
    }
  }, [isLoggedIn, navigate, isRedirecting]);
  
  // Fetch user's events
  const { data: events, isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ["/api/auth/events"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return [];
      
      const response = await fetch("/api/auth/events", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      return response.json();
    },
    enabled: isLoggedIn, // Only run query if user is logged in
    staleTime: 0, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Listen for auth changes to refresh data
  useEffect(() => {
    const handleAuthChange = () => {
      refetch();
    };
    
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [refetch]);

  // Force refetch on mount
  useEffect(() => {
    if (isLoggedIn) {
      refetch();
    }
  }, [isLoggedIn, refetch]);

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch events after deletion
      queryClient.invalidateQueries({ queryKey: ["/api/auth/events"] });
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteEvent = (eventId: number) => {
    deleteEventMutation.mutate(eventId);
  };
  
  // If not logged in, don't render the dashboard
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Welcome back, {userName || 'User'}</p>
        </div>
        <div>
          <Button onClick={() => navigate("/event/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            {error instanceof Error ? error.message : "An error occurred"}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="text-center p-8">Loading your events...</div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDeleteEvent} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first event to start collecting memories
          </p>
          <Button onClick={() => navigate("/event/create")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onDelete }: { event: Event; onDelete?: (eventId: number) => void }) {
  const [, navigate] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
      <Card>
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
          <CardDescription>Created on {formatDate(event.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{event.description || "No description"}</span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Photo Limit: {event.photoLimit} per user</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Reveal Delay: {event.revealDelay} minutes</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            className="flex-1 mr-2" 
            onClick={() => navigate(`/event/${event.id}`)}
          >
            View Event
          </Button>
          {onDelete && (
            <Button 
              variant="destructive" 
              size="icon"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

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