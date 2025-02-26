import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraView from "@/components/camera/CameraView";
import PhotoGrid from "@/components/photo/PhotoGrid";
import QRCode from "@/components/event/QRCode";
import type { Event, Photo } from "@shared/schema";
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EventPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("camera");

  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${id}`]
  });

  const { data: photos } = useQuery<Photo[]>({
    queryKey: [`/api/events/${id}/photos`]
  });

  if (!event) return null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/'}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center mr-10">{event.name}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="photos">Gallery</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="camera">
          <CameraView eventId={event.id} photoLimit={event.photoLimit} />
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