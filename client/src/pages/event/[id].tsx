import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraView from "@/components/camera/CameraView";
import PhotoGrid from "@/components/photo/PhotoGrid";
import QRCode from "@/components/event/QRCode";
import type { Event, Photo } from "@shared/schema";
import { Button } from "@/components/ui/button"
import { ArrowLeft, Crown } from "lucide-react"

interface UserInfo {
  userId: string;
  userName: string;
  eventId: number;
  isHost?: boolean;
}

export default function EventPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const eventId = id ? parseInt(id) : 0;
  const [activeTab, setActiveTab] = useState("camera");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Check if user is registered for this event
  useEffect(() => {
    if (!eventId) return;
    
    const storedUserInfo = localStorage.getItem(`event_${eventId}_user`);
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error("Failed to parse user info:", error);
      }
    }
  }, [eventId]);

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    enabled: !!id // Only run the query if id is defined
  });

  const { data: photos } = useQuery<Photo[]>({
    queryKey: [`/api/events/${id}/photos`],
    enabled: !!id // Only run the query if id is defined
  });

  // If the event is loaded and the user is the host but userInfo doesn't have isHost flag,
  // update the userInfo to mark them as the host
  useEffect(() => {
    if (event && userInfo && event.hostId === userInfo.userId && !userInfo.isHost) {
      const updatedUserInfo = { ...userInfo, isHost: true };
      localStorage.setItem(`event_${eventId}_user`, JSON.stringify(updatedUserInfo));
      setUserInfo(updatedUserInfo);
    }
  }, [event, userInfo, eventId]);

  // Handle back button click
  const handleBackClick = () => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      // If logged in, go to dashboard
      navigate("/dashboard");
    } else {
      // If not logged in, go to home
      navigate("/");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading event...</div>;
  }

  if (!event) {
    return <div className="container mx-auto p-4 text-center">Event not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center mr-10">
          {event.name}
          {userInfo?.isHost && (
            <span className="ml-2 inline-flex items-center text-amber-500" title="You are the host">
              <Crown className="h-4 w-4" />
            </span>
          )}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="photos">Gallery</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="camera">
          <CameraView eventId={event.id} photoLimit={event.photoLimit} isHost={userInfo?.isHost} />
        </TabsContent>

        <TabsContent value="photos">
          <PhotoGrid photos={photos || []} revealDelay={event.revealDelay} />
        </TabsContent>

        <TabsContent value="share">
          <QRCode eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}