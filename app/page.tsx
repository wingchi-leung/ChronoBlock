"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import AuthModal from '@/components/auth/AuthModal';
import { Loader2, Calendar, Clock, CheckCircle2, Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function Home() {
  const { currentView } = useStore();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="loader-sketch mx-auto"></div>
          <p className="text-muted-foreground font-mono">Loading ChronoBlock...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Header />
          
          <main className="container-custom py-16 lg:py-24">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center space-y-8 mb-20">
                <div className="space-y-6">
                  {/* 手绘风格装饰元素 */}
                  <div className="flex justify-center mb-8">
                    <div className="relative">
                      <div className="w-20 h-20 border-2 border-black dark:border-white animate-float">
                        <div className="w-full h-full border border-dashed border-current opacity-50 transform rotate-3"></div>
                      </div>
                      <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-pulse" />
                    </div>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                    <span className="block text-foreground">Master</span>
                    <span className="block text-accent font-mono transform -rotate-1">Your Time</span>
                  </h1>
                  
                  <div className="max-w-3xl mx-auto">
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                      ChronoBlock transforms chaos into clarity with 
                      <span className="text-foreground font-semibold"> visual time blocks</span> and 
                      <span className="text-foreground font-semibold"> intelligent scheduling</span>.
                    </p>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-sketch px-8 py-4 text-lg font-semibold flex items-center gap-3 group"
                  >
                    <span>Start Building</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4" />
                    <span className="font-mono">Free • No Credit Card</span>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-20">
                <div className="card-sketch p-8 group">
                  <div className="icon-sketch w-16 h-16 mb-6 flex items-center justify-center border-2 border-current">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Visual Time Blocks</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Drag, drop, and resize time blocks with an intuitive interface that makes scheduling feel natural.
                  </p>
                  <div className="divider-sketch mt-6 opacity-30"></div>
                </div>

                <div className="card-sketch p-8 group">
                  <div className="icon-sketch w-16 h-16 mb-6 flex items-center justify-center border-2 border-current">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Smart Scheduling</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Automatic conflict detection and intelligent suggestions keep your schedule optimized and stress-free.
                  </p>
                  <div className="divider-sketch mt-6 opacity-30"></div>
                </div>

                <div className="card-sketch p-8 group">
                  <div className="icon-sketch w-16 h-16 mb-6 flex items-center justify-center border-2 border-current">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Progress Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mark tasks complete with satisfying animations and track your productivity over time.
                  </p>
                  <div className="divider-sketch mt-6 opacity-30"></div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="border-sketch p-8 lg:p-12 mb-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold font-mono mb-2">10K+</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Time Blocks Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold font-mono mb-2">95%</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Productivity Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold font-mono mb-2">2.5K</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold font-mono mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">Always Available</div>
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div className="text-center space-y-12">
                <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
                
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                  <div className="space-y-4">
                    <div className="w-12 h-12 border-2 border-current flex items-center justify-center font-bold text-xl mx-auto">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">Create Time Blocks</h3>
                    <p className="text-muted-foreground text-sm">
                      Double-click on your calendar to create time blocks for any activity
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 border-2 border-current flex items-center justify-center font-bold text-xl mx-auto">
                      2
                    </div>
                    <h3 className="text-lg font-semibold">Organize & Schedule</h3>
                    <p className="text-muted-foreground text-sm">
                      Drag tasks from your list directly onto the calendar to schedule them
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 border-2 border-current flex items-center justify-center font-bold text-xl mx-auto">
                      3
                    </div>
                    <h3 className="text-lg font-semibold">Track Progress</h3>
                    <p className="text-muted-foreground text-sm">
                      Mark tasks complete and watch your productivity soar with visual feedback
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="footer-sketch py-8 mt-20">
            <div className="container-custom">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono">ChronoBlock</span>
                  <span className="text-muted-foreground">© 2024</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Built with focus, designed for productivity
                </div>
              </div>
            </div>
          </footer>
        </div>

        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  // Show main app if authenticated
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <CalendarView />
      </div>
    </main>
  );
}