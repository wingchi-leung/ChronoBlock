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
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, deleteTask, convertTaskToTimeBlock, checkTimeConflict } = useStore();
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedTimeBlockId, setSelectedTimeBlockId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; timeBlockId: string } | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickInfo, setLastClickInfo] = useState<any>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

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
          handleCancelInlineEdit();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      setContextMenu(null);
      // If clicking outside while editing, save the edit
      if (inlineEditingId && editInputRef.current && !editInputRef.current.contains(e.target as Node)) {
        handleSaveInlineEdit(inlineEditingId);
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

  // Function to handle calendar area clicks (for double-click detection)
  const handleDateClick = (clickInfo: any) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Check if this is a double click (within 300ms and same position)
    if (timeDiff < 300 && lastClickInfo && 
        Math.abs(lastClickInfo.jsEvent.clientX - clickInfo.jsEvent.clientX) < 10 &&
        Math.abs(lastClickInfo.jsEvent.clientY - clickInfo.jsEvent.clientY) < 10) {
      
      // This is a double click - create time block
      handleDoubleClickTimeSlot(clickInfo);
    }
    
    // Update last click info
    setLastClickTime(currentTime);
    setLastClickInfo(clickInfo);
  };

  // Function to handle double-click on empty time slot
  const handleDoubleClickTimeSlot = (clickInfo: any) => {
    const { date } = clickInfo;
    const endTime = addMinutes(date, 30); // Default 30-minute duration
    
    // Check for conflicts before creating
    if (checkTimeConflict(date, endTime)) {
      showConflictMessage('Cannot create time block: Time slot is already occupied');
      return;
    }
    
    const newBlock = addTimeBlock(date, endTime, 'New Time Block');
    if (!newBlock) {
      showConflictMessage('Cannot create time block: Time conflict detected');
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

  // Function to handle clicking on a time block
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
      // Focus the textarea after a short delay
      setTimeout(() => {
        editInputRef.current?.focus();
        editInputRef.current?.select();
      }, 50);
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

  // Enhanced function to handle external drag (from task panel)
  const handleDrop = (dropInfo: any) => {
    try {
      const taskData = JSON.parse(dropInfo.draggedEl.dataset.task || '{}');
      if (!taskData.id) return;

      // Check if the task was dropped on an existing time block
      const droppedOnTimeBlock = findTimeBlockAtPosition(dropInfo.jsEvent.clientX, dropInfo.jsEvent.clientY);
      
      if (droppedOnTimeBlock) {
        // Task dropped on existing time block - assign task to that time block
        const success = updateTimeBlock(droppedOnTimeBlock.id, { 
          title: taskData.title 
        });
        
        if (success) {
          deleteTask(taskData.id);
          showConflictMessage(`✅ Task "${taskData.title}" assigned to existing time block`);
        } else {
          showConflictMessage('❌ Failed to assign task to time block');
        }
      } else {
        // Task dropped on empty slot - create new time block
        const duration = taskData.estimatedDuration || 30;
        const endTime = addMinutes(dropInfo.date, duration);
        
        if (checkTimeConflict(dropInfo.date, endTime)) {
          showConflictMessage('❌ Cannot drop task: Time slot is already occupied');
          return;
        }
        
        const success = convertTaskToTimeBlock(taskData.id, dropInfo.date);
        if (success) {
          showConflictMessage(`✅ Task "${taskData.title}" converted to new time block`);
        } else {
          showConflictMessage('❌ Cannot convert task: Time conflict detected');
        }
      }
    } catch (error) {
      console.error('Error parsing task data:', error);
      showConflictMessage('❌ Error processing dropped task');
    }
  };

  // Helper function to find time block at specific screen coordinates
  const findTimeBlockAtPosition = (clientX: number, clientY: number) => {
    const elements = document.elementsFromPoint(clientX, clientY);
    
    for (const element of elements) {
      // Look for FullCalendar event elements
      if (element.classList.contains('fc-event') || element.closest('.fc-event')) {
        const eventElement = element.classList.contains('fc-event') ? element : element.closest('.fc-event');
        const eventId = eventElement?.getAttribute('data-event-id') || 
                       eventElement?.querySelector('[data-event-id]')?.getAttribute('data-event-id');
        
        if (eventId) {
          return timeBlocks.find(block => block.id === eventId);
        }
      }
    }
    
    return null;
  };

  // Function to save inline edit
  const handleSaveInlineEdit = (eventId: string) => {
    if (editValue.trim()) {
      updateTimeBlock(eventId, { title: editValue.trim() });
    }
    setInlineEditingId(null);
    setEditValue('');
    // Explicitly blur the textarea
    editInputRef.current?.blur();
  };

  // Function to cancel inline edit
  const handleCancelInlineEdit = () => {
    setInlineEditingId(null);
    setEditValue('');
    // Explicitly blur the textarea
    editInputRef.current?.blur();
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
          selectable={false} // Disable selection to prevent single-click time block creation
          selectMirror={false}
          dayMaxEvents={true}
          droppable={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:15:00"
          snapDuration="00:05:00"
          selectOverlap={false}
          eventOverlap={false}
          selectConstraint={{
            start: '06:00',
            end: '22:00'
          }}
          dateClick={handleDateClick} // Handle clicks on calendar dates/times
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          drop={handleDrop}
          events={timeBlocks}
          eventContent={(info) => {
            const isEditing = inlineEditingId === info.event.id;
            const isSelected = selectedTimeBlockId === info.event.id;
            
            if (isEditing) {
              return (
                <div className="h-full w-full p-1 flex flex-col overflow-hidden">
                  <div className="text-xs font-medium mb-1 text-gray-800 dark:text-gray-200">{info.timeText}</div>
                  <textarea
                    ref={editInputRef}
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
                    className="flex-1 w-full text-xs bg-transparent resize-none text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset rounded-sm p-1"
                    style={{ minHeight: '0' }}
                  />
                </div>
              );
            }
            
            return (
              <Tooltip content={`${info.event.title} (Double-click to edit, Right-click for options, Drag tasks here to assign)`}>
                <div 
                  className={cn(
                    "h-full w-full p-1 overflow-hidden cursor-pointer",
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
                  <div className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-1">{info.timeText}</div>
                  <div className="text-xs text-gray-800 dark:text-gray-200 whitespace-normal break-words overflow-hidden" title={info.event.title}>
                    {info.event.title}
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
              'bg-white dark:bg-gray-800',
              'cursor-pointer',
              isEditing 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' 
                : isSelected
                ? 'ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
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

      {/* Feedback Message */}
      {conflictMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center gap-2 max-w-md text-center">
          {conflictMessage}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/75 text-white text-xs px-3 py-2 rounded-md pointer-events-none">
        <div>Double-click empty slot: Create</div>
        <div>Double-click time block: Edit</div>
        <div>Right-click: Delete</div>
        <div>Del key: Delete selected</div>
        <div className="text-green-300 mt-1">✨ Drag tasks to time blocks or empty slots</div>
      </div>
    </div>
  );
}