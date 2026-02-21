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
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        <Link href="/dashboard" className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors gap-2 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card className="bg-white border-stone-200 shadow-sm">
          <CardHeader className="border-b border-stone-50">
            <CardTitle className="text-3xl font-serif italic text-stone-900">Create New Event Vault</CardTitle>
            <CardDescription className="text-stone-500">
              Set the rules for your disposable camera experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stone-700">Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Smith Wedding, Summer Trip" {...field} className="bg-white border-stone-300 focus-visible:ring-stone-400" />
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
                      <FormLabel className="text-stone-700">Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Share details about the event..." {...field} className="bg-white border-stone-300 focus-visible:ring-stone-400 min-h-[100px]" />
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
                        <FormLabel className="text-stone-700">Reveal Gallery At</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} className="bg-white border-stone-300 focus-visible:ring-stone-400" />
                        </FormControl>
                        <FormDescription className="text-[11px]">When photos will be developed for everyone.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photo_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-stone-700">Max Photos (Total)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="bg-white border-stone-300 focus-visible:ring-stone-400" />
                        </FormControl>
                      <FormDescription className="text-[11px]">Max 100 photos. Use promo code to increase up to 1000.</FormDescription>
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
                      <FormLabel className="text-stone-700">Promo Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter code to boost limits" {...field} className="bg-white border-stone-300 focus-visible:ring-stone-400 font-mono uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-stone-900 text-stone-50 hover:bg-stone-800 h-12 text-lg rounded-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
