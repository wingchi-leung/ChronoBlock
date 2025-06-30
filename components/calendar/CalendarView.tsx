"use client";

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TimeBlock } from '@/types';
import { addMinutes } from 'date-fns';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2, RotateCcw, Sparkles, AlertTriangle } from 'lucide-react';

export default function CalendarView() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, toggleTimeBlockCompletion, convertTaskToTimeBlock, checkTimeConflict } = useStore();
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedTimeBlockId, setSelectedTimeBlockId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; timeBlockId: string } | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickInfo, setLastClickInfo] = useState<any>(null);
  const [fireworks, setFireworks] = useState<{ id: string; x: number; y: number }[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedTimeBlockId && !inlineEditingId) {
        e.preventDefault();
        deleteTimeBlock(selectedTimeBlockId);
        setSelectedTimeBlockId(null);
      }
      if (e.key === 'Escape') {
        setSelectedTimeBlockId(null);
        setContextMenu(null);
        if (inlineEditingId) {
          setInlineEditingId(null);
          setEditValue('');
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle editing state
      if (inlineEditingId) {
        const isEditingArea = target.closest('.editing-area') || 
                             target.closest('textarea') ||
                             target.tagName.toLowerCase() === 'textarea';
        
        if (!isEditingArea) {
          if (editValue.trim()) {
            updateTimeBlock(inlineEditingId, { title: editValue.trim() });
          }
          setInlineEditingId(null);
          setEditValue('');
        }
        return;
      }
      
      setContextMenu(null);
      
      const isTimeBlockClick = target.closest('.fc-event');
      
      if (!isTimeBlockClick) {
        setSelectedTimeBlockId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedTimeBlockId, inlineEditingId, editValue, deleteTimeBlock, updateTimeBlock]);

  // Auto-hide conflict message
  useEffect(() => {
    if (conflictMessage) {
      const timer = setTimeout(() => {
        setConflictMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [conflictMessage]);

  const showConflictMessage = (message: string) => {
    setConflictMessage(message);
  };

  const handleDateClick = (clickInfo: any) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (timeDiff < 300 && lastClickInfo && 
        Math.abs(lastClickInfo.jsEvent.clientX - clickInfo.jsEvent.clientX) < 10 &&
        Math.abs(lastClickInfo.jsEvent.clientY - clickInfo.jsEvent.clientY) < 10) {
      
      const { date } = clickInfo;
      const endTime = addMinutes(date, 45);
      
      if (checkTimeConflict(date, endTime)) {
        showConflictMessage('Cannot create time block: Time slot is already occupied');
        return;
      }
      
      const newBlock = addTimeBlock(date, endTime, 'New Time Block');
      if (!newBlock) {
        showConflictMessage('Cannot create time block: Time conflict detected');
      }
    }
    
    setLastClickTime(currentTime);
    setLastClickInfo(clickInfo);
  };

  const handleDateSelect = (selectInfo: any) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().unselect();
    }
  };

  const handleEventChange = (changeInfo: any) => {
    const { event, revert } = changeInfo;
    
    if (checkTimeConflict(event.start, event.end, event.id)) {
      showConflictMessage('Cannot move/resize time block: Time slot is already occupied');
      revert();
      return;
    }
    
    const success = updateTimeBlock(event.id, {
      start: event.start,
      end: event.end
    });
    
    if (!success) {
      showConflictMessage('Cannot update time block: Time conflict detected');
      revert();
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const { event } = clickInfo;
    const timeBlock = timeBlocks.find(block => block.id === event.id);
    if (!timeBlock) return;
    
    clickInfo.jsEvent.preventDefault();
    clickInfo.jsEvent.stopPropagation();
    
    setSelectedTimeBlockId(event.id);
    
    if (clickInfo.jsEvent.detail === 2) {
      setInlineEditingId(event.id);
      setEditValue(timeBlock.title);
    }
  };

  const handleEventRightClick = (clickInfo: any) => {
    clickInfo.jsEvent.preventDefault();
    clickInfo.jsEvent.stopPropagation();
    
    const { event, jsEvent } = clickInfo;
    setSelectedTimeBlockId(event.id);
    setContextMenu({
      x: jsEvent.clientX,
      y: jsEvent.clientY,
      timeBlockId: event.id
    });
  };

  const handleContextMenuDelete = (timeBlockId: string) => {
    deleteTimeBlock(timeBlockId);
    setContextMenu(null);
    setSelectedTimeBlockId(null);
  };

  const handleCompleteTimeBlock = (timeBlockId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const timeBlock = timeBlocks.find(block => block.id === timeBlockId);
    if (!timeBlock) return;
    
    if (!timeBlock.completed) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const fireworkId = `firework-${Date.now()}`;
      setFireworks(prev => [...prev, { id: fireworkId, x, y }]);
      
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== fireworkId));
      }, 1200);
    }
    
    toggleTimeBlockCompletion(timeBlockId);
    setSelectedTimeBlockId(null);
  };

  const handleDrop = (dropInfo: any) => {
    dropInfo.jsEvent.preventDefault();
    
    try {
      let taskData = null;
      
      try {
        const transferData = dropInfo.jsEvent.dataTransfer?.getData('text/plain');
        if (transferData) {
          taskData = JSON.parse(transferData);
        }
      } catch (e) {
        console.log('Failed to get data from dataTransfer:', e);
      }
      
      if (!taskData && dropInfo.draggedEl?.dataset?.task) {
        try {
          taskData = JSON.parse(dropInfo.draggedEl.dataset.task);
        } catch (e) {
          console.log('Failed to get data from dataset:', e);
        }
      }
      
      if (!taskData) {
        return;
      }
      
      if (taskData && taskData.id) {
        const duration = taskData.estimatedDuration || 45;
        const endTime = addMinutes(dropInfo.date, duration);
        
        if (checkTimeConflict(dropInfo.date, endTime)) {
          showConflictMessage('Cannot drop task: Time slot is already occupied');
          return;
        }
        
        const success = convertTaskToTimeBlock(taskData.id, dropInfo.date);
        
        if (!success) {
          showConflictMessage('Cannot convert task: Time conflict detected');
        }
      }
    } catch (error) {
      console.error('Error in handleDrop:', error);
      showConflictMessage('Error processing dropped task');
    }
  };

  const handleDragEnter = (info: any) => {
    info.jsEvent.preventDefault();
    return false;
  };

  const handleDragOver = (info: any) => {
    info.jsEvent.preventDefault();
    info.jsEvent.dataTransfer.dropEffect = 'move';
    return false;
  };

  const handleDragLeave = (info: any) => {
    // Handle drag leave if needed
  };

  const handleSaveInlineEdit = (eventId: string) => {
    if (editValue.trim()) {
      updateTimeBlock(eventId, { title: editValue.trim() });
    }
    setInlineEditingId(null);
    setEditValue('');
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
    setEditValue('');
  };

  return (
    <div className="w-full h-full relative bg-background">
      <div className="h-full border-sketch overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridFiveDay"
          views={{
            timeGridFiveDay: {
              type: 'timeGrid',
              duration: { days: 5 }
            }
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          height="100%"
          allDaySlot={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          droppable={true}
          dropAccept="*"
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:15:00"
          snapDuration="00:05:00"
          selectOverlap={false}
          eventOverlap={false}
          eventResizableFromStart={true}
          eventDurationEditable={true}
          eventStartEditable={true}
          eventConstraint={{
            start: '06:00',
            end: '22:00'
          }}
          selectConstraint={{
            start: '06:00',
            end: '22:00'
          }}
          dateClick={handleDateClick}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          drop={handleDrop}
          dragEnter={handleDragEnter}
          dragOver={handleDragOver}
          dragLeave={handleDragLeave}
          events={timeBlocks}
          eventContent={(info) => {
            const isEditing = inlineEditingId === info.event.id;
            const isSelected = selectedTimeBlockId === info.event.id;
            const timeBlock = timeBlocks.find(block => block.id === info.event.id);
            const isCompleted = timeBlock?.completed || false;
            
            if (isEditing) {
              return (
                <div 
                  className="editing-area h-full w-full flex flex-col overflow-hidden relative bg-background border-2 border-accent rounded-lg" 
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-mono mb-1 text-foreground px-2 pt-1 flex-shrink-0">
                    {info.timeText}
                  </div>
                  
                  <div className="flex-1 relative">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveInlineEdit(info.event.id);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelInlineEdit();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute inset-0 w-full h-full text-sm resize-none text-foreground focus:outline-none p-2 leading-relaxed bg-transparent border-none"
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      placeholder="Enter time block title..."
                    />
                  </div>
                </div>
              );
            }
            
            const titleLength = info.event.title.length;
            const shouldTruncate = titleLength > 30;
            const displayTitle = shouldTruncate ? `${info.event.title.substring(0, 30)}...` : info.event.title;
            
            return (
              <Tooltip content={shouldTruncate ? info.event.title : `${info.event.title} (Double-click to edit, Right-click for options)`}>
                <div 
                  className={cn(
                    "h-full w-full p-3 overflow-hidden cursor-pointer transition-all duration-300 relative group",
                    isSelected && "ring-2 ring-accent ring-inset",
                    isCompleted && "opacity-75"
                  )}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleEventRightClick({
                      event: info.event,
                      jsEvent: e.nativeEvent
                    });
                  }}
                >
                  {/* Completion overlay */}
                  {isCompleted && (
                    <>
                      <div className="absolute inset-0 bg-success-color/10 backdrop-blur-[1px] rounded-lg" />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-400/30 rounded-full blur-md scale-150 animate-pulse" />
                          <div className="relative bg-green-500 rounded-full p-2 shadow-lg">
                            <CheckCircle2 size={20} className="text-white" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute top-2 left-2">
                        <Sparkles size={12} className="text-green-400 opacity-60 animate-pulse" />
                      </div>
                      <div className="absolute bottom-2 right-8">
                        <Sparkles size={10} className="text-green-300 opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                    </>
                  )}
                  
                  {/* Action button */}
                  <div className="absolute -top-2 -right-2 z-20">
                    <button
                      className={cn(
                        "w-8 h-8 border-2 border-current flex items-center justify-center transition-all duration-300 transform rounded-full",
                        "shadow-lg backdrop-blur-sm",
                        isCompleted 
                          ? "bg-orange-500 text-white hover:bg-orange-600" 
                          : "bg-green-500 text-white hover:bg-green-600",
                        "hover:scale-110 hover:shadow-xl hover:-translate-y-0.5",
                        "group-hover:opacity-100 opacity-80"
                      )}
                      onClick={(e) => handleCompleteTimeBlock(info.event.id, e)}
                      title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {isCompleted ? (
                        <RotateCcw size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                  </div>
                  
                  {/* Time display */}
                  <div className={cn(
                    "text-xs font-mono mb-1 relative z-10",
                    isCompleted 
                      ? "text-muted-foreground line-through opacity-75" 
                      : "text-foreground"
                  )}>
                    {info.timeText}
                  </div>
                  
                  {/* Title display */}
                  <div 
                    className={cn(
                      "text-sm font-medium leading-tight pr-4 relative z-10",
                      isCompleted 
                        ? "text-muted-foreground line-through opacity-75" 
                        : "text-foreground"
                    )}
                    title={shouldTruncate ? info.event.title : undefined}
                  >
                    {displayTitle}
                  </div>
                  
                  {/* Completion status */}
                  {isCompleted && (
                    <div className="absolute bottom-1 left-2 flex items-center gap-1 text-xs font-medium text-green-600 relative z-10">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </Tooltip>
            );
          }}
          eventClassNames={(info) => {
            const isEditing = inlineEditingId === info.event.id;
            const isSelected = selectedTimeBlockId === info.event.id;
            const timeBlock = timeBlocks.find(block => block.id === info.event.id);
            const isCompleted = timeBlock?.completed || false;
            
            return [
              'border-2 border-foreground',
              'cursor-pointer',
              'transition-all duration-300',
              'group',
              'overflow-visible',
              isEditing 
                ? 'ring-2 ring-accent shadow-lg transform scale-[1.02]' 
                : isSelected
                ? 'ring-2 ring-accent/50 shadow-md'
                : 'hover:shadow-lg hover:transform hover:scale-[1.01]',
              isCompleted
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                : isEditing
                ? 'bg-accent/10'
                : 'bg-background hover:bg-muted/50'
            ];
          }}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 modal-sketch bg-background border-foreground min-w-[120px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-red-600 flex items-center gap-2 rounded-lg"
            onClick={() => handleContextMenuDelete(contextMenu.timeBlockId)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Conflict Message */}
      {conflictMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 notification-sketch bg-red-50 dark:bg-red-950 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 z-50 flex items-center gap-2 max-w-md">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{conflictMessage}</span>
        </div>
      )}

      {/* Fireworks Animation */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: firework.x - 30,
            top: firework.y - 30,
          }}
        >
          <div className="firework-container">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="firework-particle"
                style={{
                  '--angle': `${i * 30}deg`,
                  '--delay': `${i * 0.05}s`,
                  '--color': `hsl(${120 + i * 20}, 70%, 60%)`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Enhanced CSS Styles */}
      <style jsx global>{`
        /* Fireworks Animation */
        .firework-container {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .firework-particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 6px;
          height: 6px;
          background: var(--color, #10b981);
          border-radius: 50%;
          animation: firework-explode 1.2s ease-out forwards;
          transform-origin: center;
          box-shadow: 0 0 6px var(--color, #10b981);
          animation-delay: var(--delay, 0s);
        }

        @keyframes firework-explode {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}