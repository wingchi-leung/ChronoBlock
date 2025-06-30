"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import AuthModal from '@/components/auth/AuthModal';
import { Loader2, Calendar, Clock, CheckCircle2, Sparkles, ArrowRight, Zap, Star, TrendingUp, Users } from 'lucide-react';

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
        <div className="text-center space-y-8">
          <div className="loader-sketch mx-auto"></div>
          <p className="text-muted-foreground font-mono animate-pulse-enhanced">Loading ChronoBlock...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* 背景装饰元素 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 border-2 border-current opacity-10 animate-float"></div>
            <div className="absolute top-40 right-20 w-24 h-24 border-dashed border-2 border-current opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-40 left-1/4 w-16 h-16 border-2 border-current opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-1/3 w-20 h-20 border-dashed border-2 border-current opacity-10 animate-float" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <Header />
          
          <main className="container-custom py-16 lg:py-24 relative z-10">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <div className="text-center space-y-12 mb-24">
                <div className="space-y-8">
                  {/* 动态装饰元素 */}
                  <div className="flex justify-center mb-12">
                    <div className="relative">
                      <div className="w-24 h-24 border-3 border-current animate-float magnetic">
                        <div className="w-full h-full border-2 border-dashed border-current opacity-50 transform rotate-3 animate-pulse-enhanced"></div>
                        <div className="absolute inset-0 border border-dotted border-current opacity-30 transform -rotate-3"></div>
                      </div>
                      <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-accent animate-pulse-enhanced" />
                      <Star className="absolute -bottom-2 -left-2 w-6 h-6 text-accent animate-float" style={{ animationDelay: '1s' }} />
                    </div>
                  </div>
                  
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none">
                    <span className="block text-foreground glitch-text" data-text="Master">Master</span>
                    <span className="block text-gradient-dynamic font-mono transform -rotate-1 magnetic">Your Time</span>
                  </h1>
                  
                  <div className="max-w-4xl mx-auto">
                    <p className="text-xl md:text-3xl text-muted-foreground leading-relaxed">
                      Transform chaos into clarity with 
                      <span className="text-accent font-semibold magnetic"> visual time blocks</span>, 
                      <span className="text-accent font-semibold magnetic"> intelligent scheduling</span>, and 
                      <span className="text-accent font-semibold magnetic"> dynamic productivity tracking</span>.
                    </p>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="btn-sketch liquid-button px-10 py-5 text-xl font-bold flex items-center gap-4 group magnetic-button"
                  >
                    <span>Start Building</span>
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2 group-hover:scale-110" />
                  </button>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-accent animate-pulse-enhanced" />
                      <span className="font-mono font-semibold">Free Forever</span>
                    </div>
                    <div className="w-2 h-2 bg-current rounded-full opacity-50"></div>
                    <span className="font-mono">No Credit Card</span>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-24">
                <div className="card-sketch card-3d p-8 group magnetic">
                  <div className="icon-sketch w-20 h-20 mb-8 flex items-center justify-center border-3 border-current">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient-dynamic">Visual Time Blocks</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Drag, drop, and resize time blocks with an intuitive interface that makes scheduling feel like magic.
                  </p>
                  <div className="divider-wave opacity-40"></div>
                </div>

                <div className="card-sketch card-3d p-8 group magnetic" style={{ animationDelay: '0.2s' }}>
                  <div className="icon-sketch w-20 h-20 mb-8 flex items-center justify-center border-3 border-current">
                    <Clock className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient-dynamic">Smart Scheduling</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    AI-powered conflict detection and intelligent suggestions keep your schedule optimized and stress-free.
                  </p>
                  <div className="divider-wave opacity-40"></div>
                </div>

                <div className="card-sketch card-3d p-8 group magnetic" style={{ animationDelay: '0.4s' }}>
                  <div className="icon-sketch w-20 h-20 mb-8 flex items-center justify-center border-3 border-current">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient-dynamic">Progress Tracking</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Mark tasks complete with satisfying animations and track your productivity with beautiful insights.
                  </p>
                  <div className="divider-wave opacity-40"></div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="border-sketch p-10 lg:p-16 mb-24 magnetic card-3d">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                  <div className="text-center group">
                    <div className="text-4xl lg:text-6xl font-bold font-mono mb-3 text-gradient-dynamic">10K+</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Time Blocks Created</div>
                    <div className="w-12 h-1 bg-accent mx-auto mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                  <div className="text-center group">
                    <div className="text-4xl lg:text-6xl font-bold font-mono mb-3 text-gradient-dynamic">95%</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Productivity Increase</div>
                    <div className="w-12 h-1 bg-accent mx-auto mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                  <div className="text-center group">
                    <div className="text-4xl lg:text-6xl font-bold font-mono mb-3 text-gradient-dynamic">2.5K</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Active Users</div>
                    <div className="w-12 h-1 bg-accent mx-auto mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                  <div className="text-center group">
                    <div className="text-4xl lg:text-6xl font-bold font-mono mb-3 text-gradient-dynamic">24/7</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Always Available</div>
                    <div className="w-12 h-1 bg-accent mx-auto mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div className="text-center space-y-16 mb-24">
                <h2 className="text-4xl lg:text-6xl font-bold text-gradient-dynamic">How It Works</h2>
                
                <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                  <div className="space-y-6 group magnetic">
                    <div className="w-16 h-16 border-3 border-current flex items-center justify-center font-bold text-2xl mx-auto magnetic-button">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-accent">Create Time Blocks</h3>
                    <p className="text-muted-foreground">
                      Double-click on your calendar to create time blocks for any activity. Watch them come to life with smooth animations.
                    </p>
                    <div className="w-8 h-8 border-2 border-dashed border-current mx-auto opacity-30 animate-float"></div>
                  </div>
                  
                  <div className="space-y-6 group magnetic" style={{ animationDelay: '0.2s' }}>
                    <div className="w-16 h-16 border-3 border-current flex items-center justify-center font-bold text-2xl mx-auto magnetic-button">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-accent">Organize & Schedule</h3>
                    <p className="text-muted-foreground">
                      Drag tasks from your list directly onto the calendar. Smart conflict detection prevents overlaps automatically.
                    </p>
                    <div className="w-8 h-8 border-2 border-dashed border-current mx-auto opacity-30 animate-float"></div>
                  </div>
                  
                  <div className="space-y-6 group magnetic" style={{ animationDelay: '0.4s' }}>
                    <div className="w-16 h-16 border-3 border-current flex items-center justify-center font-bold text-2xl mx-auto magnetic-button">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-accent">Track Progress</h3>
                    <p className="text-muted-foreground">
                      Mark tasks complete and celebrate with fireworks! Watch your productivity soar with visual feedback.
                    </p>
                    <div className="w-8 h-8 border-2 border-dashed border-current mx-auto opacity-30 animate-float"></div>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="text-center space-y-12">
                <h2 className="text-3xl lg:text-4xl font-bold">Join the Productivity Revolution</h2>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="card-sketch p-6 magnetic">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-current" />
                        ))}
                      </div>
                      <span className="font-mono text-sm">5.0</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "ChronoBlock transformed how I manage my time. The visual approach just clicks!"
                    </p>
                    <div className="mt-4 text-xs font-mono text-muted-foreground">- Sarah K., Designer</div>
                  </div>
                  
                  <div className="card-sketch p-6 magnetic" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      <span className="font-mono text-sm font-bold">+150% Productivity</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "I've never been more organized. The drag-and-drop interface is incredibly intuitive."
                    </p>
                    <div className="mt-4 text-xs font-mono text-muted-foreground">- Mike R., Developer</div>
                  </div>
                  
                  <div className="card-sketch p-6 magnetic" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-accent" />
                      <span className="font-mono text-sm font-bold">Team Favorite</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "Our entire team switched to ChronoBlock. The visual scheduling is a game-changer."
                    </p>
                    <div className="mt-4 text-xs font-mono text-muted-foreground">- Alex T., Manager</div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="footer-sketch py-12 mt-32">
            <div className="container-custom">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-2 border-current flex items-center justify-center">
                    <div className="w-4 h-4 border border-dashed border-current transform rotate-12"></div>
                  </div>
                  <span className="font-bold font-mono text-xl">ChronoBlock</span>
                  <span className="text-muted-foreground">© 2024</span>
                </div>
                <div className="text-muted-foreground font-mono">
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