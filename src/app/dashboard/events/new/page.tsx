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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeftIcon, SpinnerGapIcon } from "@phosphor-icons/react"
import { AppHeader } from "@/components/app/AppHeader"
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
    <div className="min-h-[100dvh]">
      <AppHeader />
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 md:px-8 md:py-14 lg:grid-cols-[1fr_minmax(0,560px)] lg:gap-16">
        <div>
          <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm text-ink-400 transition-colors hover:text-ink-100">
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
            All vaults
          </Link>
          <h1 className="mt-6 font-display text-4xl font-bold tracking-[-0.035em] text-ink-100 md:text-5xl">Load a new roll</h1>
          <p className="mt-4 max-w-[38ch] text-lg leading-relaxed text-ink-400">
            Give the vault a name, choose when it opens, and decide how many shots the whole event gets.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="surface space-y-8 p-6 md:p-8">
            <fieldset className="space-y-5">
              <legend className="mb-5 font-display text-lg font-semibold tracking-[-0.02em] text-ink-100">The event</legend>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event name</FormLabel>
                    <FormControl>
                      <Input placeholder="Mira and Leo's wedding" {...field} />
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
                    <FormLabel>Description <span className="font-normal text-ink-400">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Where, when, anything guests should know" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <fieldset className="space-y-5 border-t border-white/[0.06] pt-8">
              <legend className="sr-only">Roll and reveal</legend>
              <p aria-hidden className="font-display text-lg font-semibold tracking-[-0.02em] text-ink-100">Roll and reveal</p>
              <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="reveal_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reveal photos at</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="tabular font-mono text-sm" />
                      </FormControl>
                      <FormDescription>Everyone sees the gallery at this moment.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shots on the roll</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="tabular" />
                      </FormControl>
                      <FormDescription>Up to 100. A promo code unlocks more.</FormDescription>
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
                    <FormLabel>Promo code <span className="font-normal text-ink-400">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Code" {...field} className="font-mono tracking-[0.15em] uppercase placeholder:tracking-normal placeholder:normal-case" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <Button type="submit" size="xl" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <SpinnerGapIcon className="size-5 animate-spin" />
                  Creating vault...
                </>
              ) : "Create vault"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  )
}
