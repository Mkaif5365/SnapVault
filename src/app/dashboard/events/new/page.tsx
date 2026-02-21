"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters."),
  description: z.string().optional(),
  reveal_time: z.string().min(1, "Please select a reveal time."),
  photo_limit: z.coerce.number().min(1).max(1000, "Maximum total limit is 1000."),
  promocode: z.string().optional(),
}).refine((data) => {
  if (data.photo_limit > 100 && data.promocode !== "DEV1000") {
    return false
  }
  return true
}, {
  message: "A valid promo code is required for more than 100 photos.",
  path: ["promocode"],
})

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      reveal_time: "",
      photo_limit: 100,
      promocode: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Generate random 6-char code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Final limit is whatever the user specified (validated by Zod)
    const finalLimit = values.photo_limit

    const { error } = await supabase
      .from("events")
      .insert({
        host_id: user.id,
        name: values.name,
        description: values.description,
        reveal_time: new Date(values.reveal_time).toISOString(),
        photo_limit: finalLimit,
        code: code,
      })

    if (error) {
      console.error(error)
      alert("Failed to create event: " + error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 p-4 md:p-8 flex flex-col items-center antialiased relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        <Link href="/dashboard" className="inline-flex items-center text-stone-500 hover:text-amber-500 transition-all gap-2 text-[10px] uppercase tracking-[0.2em] font-mono group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        <Card className="bg-stone-900/40 border-stone-800/50 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <CardHeader className="pt-10 pb-6">
            <CardTitle className="text-3xl font-serif italic text-stone-100">Create New Event Vault</CardTitle>
            <CardDescription className="text-stone-500 font-light">
              Configure your vault settings and reveal timer.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Smith Wedding, Summer Trip" {...field} className="h-12 bg-stone-950/50 border-stone-800 text-stone-100 placeholder:text-stone-700 focus-visible:ring-amber-500/30 rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share details about the event..." {...field} className="bg-stone-950/50 border-stone-800 text-stone-100 placeholder:text-stone-700 focus-visible:ring-amber-500/30 rounded-xl min-h-[100px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reveal_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Reveal Images At</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} className="h-12 bg-stone-950/50 border-stone-800 text-stone-100 font-mono focus-visible:ring-amber-500/30 rounded-xl" />
                        </FormControl>
                        <FormDescription className="text-[10px] font-mono text-stone-600 uppercase tracking-tight">When images will be revealed to guests.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photo_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Max Images (Total)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-12 bg-stone-950/50 border-stone-800 text-stone-100 focus-visible:ring-amber-500/30 rounded-xl" />
                        </FormControl>
                      <FormDescription className="text-[10px] font-mono text-stone-600 uppercase tracking-tight">Standard limit is 100. Use code to boost.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="promocode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Promo Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter code to boost limit" {...field} className="h-12 bg-stone-950/50 border-stone-800 text-stone-100 placeholder:text-stone-700 focus-visible:ring-amber-500/30 rounded-xl font-mono uppercase tracking-widest" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-amber-500 text-stone-950 hover:bg-amber-400 h-14 text-lg rounded-full font-bold shadow-lg shadow-amber-500/10 active:scale-95 transition-all" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing Vault...
                    </>
                  ) : "Create Event Vault"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
