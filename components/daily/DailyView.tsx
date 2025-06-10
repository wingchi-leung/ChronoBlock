"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { format, isToday, parseISO, startOfDay, endOfDay, addHours, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import TimeBlockList from '@/components/daily/TimeBlockList';
import TaskList from '@/components/daily/TaskList';
import { cn } from '@/lib/utils';

export default function DailyView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const { timeBlocks, tasks } = useStore();
  
  // Filter time blocks for the selected day
  const dailyTimeBlocks = timeBlocks.filter(block => 
    isWithinInterval(new Date(block.start), {
      start: startOfDay(selectedDate),
      end: endOfDay(selectedDate)
    })
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  // Handle navigation to previous/next day
  const goToPrevDay = () => {
    setSelectedDate(prev => addHours(prev, -24));
  };
  
  const goToNextDay = () => {
    setSelectedDate(prev => addHours(prev, 24));
  };
  
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevDay}
            className="h-8 w-8"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-1 px-3 h-8"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <span className={cn(
              "font-medium",
              isToday(selectedDate) && "text-primary"
            )}>
              {isToday(selectedDate) ? "Today" : format(selectedDate, "MMMM d, yyyy")}
            </span>
            <Calendar size={14} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextDay}
            className="h-8 w-8"
          >
            <ChevronRight size={16} />
          </Button>
          
          {!isToday(selectedDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="h-8 text-xs ml-2"
            >
              Today
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <span className="font-mono">{dailyTimeBlocks.length}</span> time blocks
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <TimeBlockList timeBlocks={dailyTimeBlocks} selectedDate={selectedDate} />
        <TaskList selectedDate={selectedDate} />
      </div>
    </div>
  );
}