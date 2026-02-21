import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Camera, Timer, Image, QrCode, Lock, Download } from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-900/15 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8 max-w-3xl">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32 md:w-48 md:h-48 animate-in fade-in zoom-in duration-1000">
              {/* Logo Glow */}
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
              <img 
                src="/logo.png" 
                alt="SnapVault Logo" 
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              />
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-amber-500/70 font-mono">Disposable Camera for Events</p>
          <h1 className="text-7xl md:text-8xl font-serif italic text-stone-100 tracking-tight leading-[0.9]">
            SnapVault
          </h1>
          <p className="text-xl md:text-2xl text-stone-400 max-w-xl mx-auto leading-relaxed font-light">
            A time-locked photo experience for your events. Capture now, reveal later — like developing film.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-amber-500 text-stone-950 hover:bg-amber-400 rounded-full text-lg px-8 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95 transition-all duration-200 cursor-pointer border-none">
                Start Hosting →
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-stone-800 text-stone-100 hover:bg-stone-700 border-stone-700 rounded-full text-lg px-8 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-stone-700 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-1.5 bg-stone-500 rounded-full" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 bg-stone-900/50">
        <div className="max-w-5xl mx-auto text-center space-y-20">
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/70 font-mono">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-serif italic text-stone-100">Three Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">Step 01</p>
                <h3 className="text-xl font-serif italic text-stone-200">Create & Share</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Host creates an event, sets a reveal time, and shares the QR code or link. No downloads needed.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center">
                <Camera className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">Step 02</p>
                <h3 className="text-xl font-serif italic text-stone-200">Capture Moments</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Guests snap photos with vintage filters using their phone browser. No app install required.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center">
                <Image className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">Step 03</p>
                <h3 className="text-xl font-serif italic text-stone-200">Reveal Together</h3>
                <p className="text-stone-500 text-sm leading-relaxed">
                  When the timer hits zero, all photos are revealed at once — like developing a roll of film.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500/70 font-mono">Features</p>
            <h2 className="text-4xl md:text-5xl font-serif italic text-stone-100">Built for Real Events</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Camera, title: "Vintage Camera Filters", desc: "Grainy B&W, Vintage Sepia, Polaroid Soft, and '98 Date Stamp filters with real-time preview." },
              { icon: Timer, title: "Time-Lock Vault", desc: "Photos stay hidden until your chosen reveal time. Build anticipation with a reveal countdown." },
              { icon: Lock, title: "Host Controls", desc: "Lock events, kick participants, adjust reveal times, and manage everything from your dashboard." },
              { icon: Download, title: "One-Click Download", desc: "Download all event photos as a ZIP file. Named sequentially—just like a real camera roll." },
            ].map((feature, i) => (
              <div key={i} className="bg-stone-900/50 border border-stone-800 rounded-2xl p-8 space-y-4 hover:border-stone-700 transition-colors">
                <feature.icon className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-serif italic text-stone-200">{feature.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-stone-900/30 border-t border-stone-800">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-serif italic text-stone-100">Ready to Create Your First Vault?</h2>
          <p className="text-stone-500">Free to use. No downloads needed. Works on any device.</p>
          <Link href="/register">
            <Button size="lg" className="bg-stone-100 text-stone-900 hover:bg-white rounded-full text-lg px-10 shadow-lg hover:shadow-xl hover:shadow-white/10 active:scale-95 transition-all duration-200 cursor-pointer">
              Get Started Free →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-stone-900 text-center">
        <p className="text-stone-700 text-xs font-mono tracking-widest uppercase">
          &copy; {new Date().getFullYear()} SnapVault // Built with nostalgia
        </p>
      </footer>
    </div>
  );
}
