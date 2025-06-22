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

export default function CalendarView() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, convertTaskToTimeBlock, checkTimeConflict } = useStore();
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedTimeBlockId, setSelectedTimeBlockId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; timeBlockId: string } | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickInfo, setLastClickInfo] = useState<any>(null);
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
        setInlineEditingId(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      setContextMenu(null);
      
      // Check if click is outside any time block
      const target = e.target as HTMLElement;
      const isTimeBlockClick = target.closest('.fc-event');
      const isEditingArea = target.closest('.editing-area');
      
      if (!isTimeBlockClick && !isEditingArea && inlineEditingId) {
        // Save and exit editing mode when clicking outside
        handleSaveInlineEdit(inlineEditingId);
      }
      
      if (!isTimeBlockClick) {
        // Clear selection when clicking outside time blocks
        setSelectedTimeBlockId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedTimeBlockId, inlineEditingId, deleteTimeBlock]);

  // Auto-hide conflict message
  useEffect(() => {
    if (conflictMessage) {
      const timer = setTimeout(() => {
        setConflictMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [conflictMessage]);

  // Function to show conflict message
  const showConflictMessage = (message: string) => {
    setConflictMessage(message);
  };

  // Function to handle double-click for time block creation
  const handleDateClick = (clickInfo: any) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Check if this is a double-click (within 300ms and same location)
    if (timeDiff < 300 && lastClickInfo && 
        Math.abs(lastClickInfo.jsEvent.clientX - clickInfo.jsEvent.clientX) < 10 &&
        Math.abs(lastClickInfo.jsEvent.clientY - clickInfo.jsEvent.clientY) < 10) {
      
      // This is a double-click, create time block
      const { date } = clickInfo;
      const endTime = addMinutes(date, 45); // 45 minutes default
      
      // Check for conflicts before creating
      if (checkTimeConflict(date, endTime)) {
        showConflictMessage('Cannot create time block: Time slot is already occupied');
        return;
      }
      
      const newBlock = addTimeBlock(date, endTime, 'New Time Block');
      if (!newBlock) {
        showConflictMessage('Cannot create time block: Time conflict detected');
      }
    }
    
    // Store click info for double-click detection
    setLastClickTime(currentTime);
    setLastClickInfo(clickInfo);
  };

  // Remove the old select handler since we're using double-click now
  const handleDateSelect = (selectInfo: any) => {
    // Clear the selection immediately since we don't want selection-based creation
    if (calendarRef.current) {
      calendarRef.current.getApi().unselect();
    }
  };

  // Function to handle time block updates (drag & resize) with conflict checking
  const handleEventChange = (changeInfo: any) => {
    const { event, revert } = changeInfo;
    
    // Check for conflicts before updating
    if (checkTimeConflict(event.start, event.end, event.id)) {
      showConflictMessage('Cannot move time block: Time slot is already occupied');
      revert(); // Revert the change
      return;
    }
    
    const success = updateTimeBlock(event.id, {
      start: event.start,
      end: event.end
    });
    
    if (!success) {
      showConflictMessage('Cannot update time block: Time conflict detected');
      revert(); // Revert the change
    }
  };

  // Function to handle double-clicking on a time block to edit it inline
  const handleEventClick = (clickInfo: any) => {
    const { event } = clickInfo;
    const timeBlock = timeBlocks.find(block => block.id === event.id);
    if (!timeBlock) return;
    
    // Prevent default calendar behavior
    clickInfo.jsEvent.preventDefault();
    clickInfo.jsEvent.stopPropagation();
    
    // Set as selected
    setSelectedTimeBlockId(event.id);
    
    // Start inline editing on double click
    if (clickInfo.jsEvent.detail === 2) {
      setInlineEditingId(event.id);
      setEditValue(timeBlock.title);
    }
  };

  // Function to handle mouse leave from time block
  const handleEventMouseLeave = (mouseLeaveInfo: any) => {
    const { event } = mouseLeaveInfo;
    
    // If this time block is being edited, save and exit editing mode
    if (inlineEditingId === event.id) {
      handleSaveInlineEdit(event.id);
    }
  };

  // Function to handle right-click context menu
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

  // Function to handle context menu delete
  const handleContextMenuDelete = (timeBlockId: string) => {
    deleteTimeBlock(timeBlockId);
    setContextMenu(null);
    setSelectedTimeBlockId(null);
  };

  // Function to handle dropping a task onto the calendar with conflict checking
  const handleEventReceive = (receiveInfo: any) => {
    const { event } = receiveInfo;
    const taskData = event.extendedProps.taskData;
    
    if (taskData) {
      // Check for conflicts before converting
      const duration = taskData.estimatedDuration || 45; // Increased default duration
      const endTime = addMinutes(event.start, duration);
      
      if (checkTimeConflict(event.start, endTime)) {
        showConflictMessage('Cannot drop task: Time slot is already occupied');
        event.remove(); // Remove the temporary event
        return;
      }
      
      // Convert the task to a time block
      const success = convertTaskToTimeBlock(taskData.id, event.start);
      if (!success) {
        showConflictMessage('Cannot convert task: Time conflict detected');
      }
      
      // Remove the temporary event that was created by the drag
      event.remove();
    }
  };

  // Function to handle external drag (from task panel) with conflict checking
  const handleDrop = (dropInfo: any) => {
    try {
      const taskData = JSON.parse(dropInfo.draggedEl.dataset.task || '{}');
      if (taskData.id) {
        // Check for conflicts before converting
        const duration = taskData.estimatedDuration || 45; // Increased default duration
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
      console.error('Error parsing task data:', error);
    }
  };

  // Function to save inline edit
  const handleSaveInlineEdit = (eventId: string) => {
    if (editValue.trim()) {
      updateTimeBlock(eventId, { title: editValue.trim() });
    }
    setInlineEditingId(null);
    setEditValue('');
  };

  // Function to cancel inline edit
  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
    setEditValue('');
  };

  return (
    <div className="w-full h-full relative">
      <div className="h-full border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden bg-white dark:bg-gray-900">
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
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:15:00"
          snapDuration="00:05:00"
          selectOverlap={false} // Prevent selection over existing events
          eventOverlap={false} // Prevent event overlap
          progressiveEventRendering={false} // Disable progressive rendering to prevent progress bars
          selectConstraint={{
            start: '06:00',
            end: '22:00'
          }}
          dateClick={handleDateClick} // Use dateClick instead of select for double-click detection
          select={handleDateSelect} // Keep this to clear selections
          eventClick={handleEventClick}
          eventMouseLeave={handleEventMouseLeave} // Add mouse leave handler
          eventChange={handleEventChange}
          eventReceive={handleEventReceive}
          drop={handleDrop}
          events={timeBlocks}
          eventContent={(info) => {
            const isEditing = inlineEditingId === info.event.id;
            const isSelected = selectedTimeBlockId === info.event.id;
            
            if (isEditing) {
              return (
                <div className="editing-area h-full w-full flex flex-col overflow-hidden relative">
                  {/* Time display */}
                  <div className="text-xs font-medium mb-1 text-gray-900 dark:text-gray-100 px-2 pt-1 flex-shrink-0">
                    {info.timeText}
                  </div>
                  
                  {/* Full-size editing area */}
                  <div className="flex-1 relative">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveInlineEdit(info.event.id);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelInlineEdit();
                        }
                      }}
                      onBlur={() => handleSaveInlineEdit(info.event.id)}
                      className="absolute inset-0 w-full h-full text-sm bg-transparent resize-none text-gray-900 dark:text-gray-100 focus:outline-none border-none p-2 leading-relaxed"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '6px',
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.3)'
                      }}
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
                    "h-full w-full p-2 overflow-hidden cursor-pointer transition-all duration-200",
                    isSelected && "ring-2 ring-blue-500 ring-inset"
                  )}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleEventRightClick({
                      event: info.event,
                      jsEvent: e.nativeEvent
                    });
                  }}
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {info.timeText}
                  </div>
                  <div 
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight" 
                    title={shouldTruncate ? info.event.title : undefined}
                  >
                    {displayTitle}
                  </div>
                </div>
              </Tooltip>
            );
          }}
          eventClassNames={(info) => {
            const isEditing = inlineEditingId === info.event.id;
            const isSelected = selectedTimeBlockId === info.event.id;
            return [
              'border-2 border-gray-800 dark:border-gray-200',
              'cursor-pointer',
              'transition-all duration-200',
              // Remove any classes that might cause progress bars
              'fc-event-no-progress',
              isEditing 
                ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02]' 
                : isSelected
                ? 'ring-2 ring-blue-400 shadow-md'
                : 'hover:shadow-md hover:transform hover:scale-[1.01]',
              // Enhanced background with gradient
              isEditing
                ? 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30'
                : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800'
            ];
          }}
        />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[120px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2"
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {conflictMessage}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/75 text-white text-xs px-3 py-2 rounded-md pointer-events-none">
        <div className="text-yellow-300 font-medium">📋 Instructions:</div>
        <div>Double-click: Create time block</div>
        <div>Double-click block: Edit</div>
        <div>Right-click: Delete</div>
        <div>Del key: Delete selected</div>
        <div className="text-yellow-300 mt-1">⚠️ Overlapping prevented</div>
      </div>

      {/* Custom CSS to hide progress bars */}
      <style jsx global>{`
        .fc-event-no-progress .fc-event-main {
          overflow: hidden !important;
        }
        
        .fc-event-no-progress .fc-event-main::after {
          display: none !important;
        }
        
        .fc-event .fc-event-main-frame {
          overflow: hidden !important;
        }
        
        .fc-event .fc-event-time,
        .fc-event .fc-event-title {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        
        /* Hide any potential progress indicators */
        .fc-event .fc-event-resizer,
        .fc-event .fc-event-main::after,
        .fc-event .fc-event-main::before {
          display: none !important;
        }
        
        /* Ensure clean event rendering */
        .fc-event {
          overflow: hidden !important;
        }
        
        .fc-event-main {
          padding: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
    </div>
  );
}