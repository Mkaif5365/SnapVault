import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { userRegistrationSchema, type UserRegistration, type Event } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

export default function RegisterForEvent() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const eventId = parseInt(id);
  
  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`]
  });

  const form = useForm<UserRegistration>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      eventId,
      userName: ""
    }
  });

  const handleSubmit = (data: UserRegistration) => {
    // Generate a unique user ID
    const userId = uuidv4();
    
    // Store user info in localStorage
    localStorage.setItem(`event_${eventId}_user`, JSON.stringify({
      userId,
      userName: data.userName,
      eventId
    }));
    
    // Navigate to the event page
    navigate(`/event/${eventId}`);
  };

  if (eventLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4 max-w-lg">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-500">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Join Event: {event.name}</CardTitle>
          <CardDescription>
            {event.description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Join Event
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 