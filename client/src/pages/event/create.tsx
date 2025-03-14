import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { v4 as uuidv4 } from "uuid";

export default function CreateEvent() {
  const [, navigate] = useLocation();
  
  const form = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      name: "",
      description: "",
      hostName: "",
      photoLimit: 3,
      revealDelay: 5
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertEvent) => {
      // Generate a unique host ID
      const hostId = uuidv4();
      const eventData = { ...data, hostId };
      
      const res = await apiRequest("POST", "/api/events", eventData);
      return res.json();
    },
    onSuccess: (data) => {
      // Store host information in localStorage
      localStorage.setItem(`event_${data.id}_user`, JSON.stringify({
        userId: data.hostId,
        userName: data.hostName,
        eventId: data.id,
        isHost: true
      }));
      
      navigate(`/event/${data.id}`);
    }
  });

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hostName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name (Host)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="Enter your name" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photoLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo Limit per Guest</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revealDelay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reveal Delay (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                Create Event
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}