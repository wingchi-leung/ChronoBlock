"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import AuthModal from '@/components/auth/AuthModal';
import { Loader2, Calendar, Clock, CheckCircle2 } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading ChronoBlock...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Header />
          
          <main className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  Master Your Time
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                  ChronoBlock helps you organize your day with beautiful time blocks and intelligent task management.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Visual Time Blocks</h3>
                  <p className="text-muted-foreground text-sm">
                    Create and manage time blocks with an intuitive drag-and-drop calendar interface.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically prevent conflicts and optimize your schedule for maximum productivity.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Task Completion</h3>
                  <p className="text-muted-foreground text-sm">
                    Track your progress with beautiful completion animations and detailed analytics.
                  </p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 space-y-6">
                <h2 className="text-3xl font-bold">Ready to get started?</h2>
                <p className="text-muted-foreground">
                  Join thousands of users who have transformed their productivity with ChronoBlock.
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </main>
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
    <main className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        <CalendarView />
      </div>
    </main>
  );
}