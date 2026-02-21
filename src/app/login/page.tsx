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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 antialiased overflow-hidden relative">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

      <Link href="/" className="mb-12 flex items-center gap-3 group relative z-10 transition-transform hover:scale-105 active:scale-95">
        <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-100 shadow-xl border border-stone-800 overflow-hidden">
          <img src="/logo.png" alt="SnapVault" className="w-8 h-8 object-contain" />
        </div>
        <span className="text-2xl font-serif italic text-stone-100 tracking-tight">SnapVault</span>
      </Link>

      <Card className="w-full max-w-md bg-stone-900/40 border border-stone-800/50 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        {/* Top Decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        <CardHeader className="space-y-2 pt-10 pb-6 text-center">
          <CardTitle className="text-3xl font-serif italic text-stone-100">Welcome Back</CardTitle>
          <CardDescription className="text-stone-500 font-light">Welcome back, Host. Enter your credentials.</CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="host@example.com" 
                        {...field} 
                        className="h-12 bg-stone-950/50 border-stone-800 text-stone-100 placeholder:text-stone-700 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50 rounded-xl transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-[10px] uppercase tracking-wider font-mono" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono ml-1">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••" 
                        {...field} 
                        className="h-12 bg-stone-950/50 border-stone-800 text-stone-100 placeholder:text-stone-700 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50 rounded-xl transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-[10px] uppercase tracking-wider font-mono" />
                  </FormItem>
                )}
              />
              {error && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-xs text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-12 bg-amber-500 text-stone-950 hover:bg-amber-400 rounded-xl font-medium transition-all active:scale-[0.98] shadow-lg shadow-amber-500/10" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
          <div className="mt-8 text-center text-sm">
            <span className="text-stone-500 font-light">Don't have an account? </span>
            <Link href="/register" className="text-stone-300 hover:text-amber-500 transition-colors underline underline-offset-4 decoration-stone-800 hover:decoration-amber-500/30">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <footer className="mt-12 text-stone-700 text-[10px] font-mono tracking-[0.3em] uppercase">
        SnapVault // Secure Access
      </footer>
    </div>
  )
}
