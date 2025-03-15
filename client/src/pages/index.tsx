import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Camera, Users, Clock, Share2, ArrowRight, Star, Quote, Image, Gift, Heart, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { isLoggedIn } = useAuth();
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Badge className="mb-4 px-4 py-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary border-none">
              Capture. Share. Remember.
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              SnapVault
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              Create disposable camera events, capture memories with vintage filters, and reveal them together.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              {isLoggedIn ? (
                <>
                  <Button size="lg" className="group" onClick={() => navigate("/dashboard")}>
                    My Events
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/event/create")}>
                    Create Event
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="group" onClick={() => navigate("/login")}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/signup")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Floating elements for visual interest */}
        <motion.div 
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-20 -right-10 w-60 h-60 rounded-full bg-primary/10 blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-24">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Badge className="mb-4 px-4 py-1 text-sm">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SnapVault?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rediscover the joy of anticipation and surprise with our unique photo-sharing experience.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <FeatureCard 
            icon={<Camera className="h-10 w-10" />}
            title="Disposable Camera"
            description="Take photos with vintage filters that mimic the feel of disposable cameras."
          />
          <FeatureCard 
            icon={<Users className="h-10 w-10" />}
            title="Group Events"
            description="Create events for weddings, parties, or gatherings where everyone can contribute photos."
          />
          <FeatureCard 
            icon={<Clock className="h-10 w-10" />}
            title="Delayed Reveal"
            description="Photos remain hidden until a specified time, creating anticipation and excitement."
          />
          <FeatureCard 
            icon={<Share2 className="h-10 w-10" />}
            title="Easy Sharing"
            description="Share events with a simple QR code that guests can scan to join and take photos."
          />
        </motion.div>
      </div>
      
      {/* Demo Section */}
      <div className="bg-gradient-to-b from-background to-primary/5 py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4 px-4 py-1 text-sm">Demo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See SnapVault in Action</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience how SnapVault transforms your events with our interactive demo
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="rounded-xl overflow-hidden shadow-2xl border border-primary/10"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center p-8">
                  <Image className="h-16 w-16 mx-auto mb-4 text-primary/60" />
                  <p className="text-lg font-medium">Demo Video</p>
                  <p className="text-sm text-muted-foreground">Interactive preview of the SnapVault experience</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full mr-4">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Create Memorable Events</h3>
                    <p className="text-muted-foreground">Set up custom events for weddings, parties, or any special occasion.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full mr-4">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Capture Authentic Moments</h3>
                    <p className="text-muted-foreground">Our vintage filters bring back the charm of disposable cameras.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="mt-1 bg-primary/20 p-2 rounded-full mr-4">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Experience the Reveal</h3>
                    <p className="text-muted-foreground">The excitement of seeing all photos together after the event.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="mt-4" 
                onClick={() => navigate(isLoggedIn ? "/event/create" : "/signup")}
              >
                Try It Now
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge className="mb-4 px-4 py-1 text-sm">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to create memorable photo experiences
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <StepCard 
              number="1"
              title="Create an Event"
              description="Sign up and create a new event with custom settings like photo limits and reveal delay."
            />
            <StepCard 
              number="2"
              title="Share with Guests"
              description="Share the event QR code with your guests so they can join and take photos."
            />
            <StepCard 
              number="3"
              title="Capture Memories"
              description="Everyone takes photos through the app with fun vintage filters."
            />
            <StepCard 
              number="4"
              title="Reveal Together"
              description="After the reveal delay, all photos become visible to everyone in the event."
            />
          </motion.div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-primary/5 py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4 px-4 py-1 text-sm">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from people who have used SnapVault for their special events
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="SnapVault made our wedding so much more fun! Everyone loved taking photos and the reveal was magical."
              author="Sarah & Michael"
              role="Wedding Couple"
              rating={5}
            />
            <TestimonialCard 
              quote="I used this for my graduation party and it was a hit! The vintage filters gave our photos such a unique vibe."
              author="James Wilson"
              role="College Graduate"
              rating={5}
            />
            <TestimonialCard 
              quote="Perfect for our family reunion. The delayed reveal created so much excitement when we all got to see the photos together."
              author="Emma Rodriguez"
              role="Family Event Organizer"
              rating={4}
            />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 p-12 rounded-2xl border border-primary/10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your First Event?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join SnapVault today and start capturing memories in a whole new way.
          </p>
          <Button size="lg" className="group" onClick={() => navigate(isLoggedIn ? "/event/create" : "/signup")}>
            {isLoggedIn ? "Create Event" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
      
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Camera className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-xl">SnapVault</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2023 SnapVault. All rights reserved.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/privacy")}>Privacy</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/terms")}>Terms</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/contact")}>Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      className="bg-card p-8 rounded-xl shadow-sm border border-primary/10 hover:border-primary/30 transition-colors"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <motion.div 
      className="bg-card p-8 rounded-xl shadow-sm border border-primary/10 relative"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2 mt-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

function TestimonialCard({ quote, author, role, rating }: { quote: string, author: string, role: string, rating: number }) {
  return (
    <motion.div 
      className="bg-card p-8 rounded-xl shadow-sm border border-primary/10"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Quote className="h-8 w-8 text-primary/40 mb-4" />
      <p className="text-lg mb-6 italic">{quote}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
        <div className="flex">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
          ))}
          {Array.from({ length: 5 - rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 text-muted-foreground" />
          ))}
        </div>
      </div>
    </motion.div>
  );
} 