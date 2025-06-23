"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import CalendarView from '@/components/calendar/CalendarView';
import DailyView from '@/components/daily/DailyView';

export default function Home() {
  const { currentView } = useStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Header />
      
      <div className="flex-1 overflow-hidden">
        {currentView === 'calendar' ? (
          <CalendarView />
        ) : (
          <DailyView />
        )}
      </div>
    </main>
  );
}