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
import { Check, CheckCircle2, RotateCcw } from 'lucide-react';

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
        // Check if clicking inside the editing area
        const isEditingArea = target.closest('.editing-area') || 
                             target.closest('textarea') ||
                             target.tagName.toLowerCase() === 'textarea';
        
        if (!isEditingArea) {
          // Save and exit editing mode when clicking outside
          if (editValue.trim()) {
            updateTimeBlock(inlineEditingId, { title: editValue.trim() });
          }
          setInlineEditingId(null);
          setEditValue('');
        }
        return;
      }
      
      setContextMenu(null);
      
      // Check if click is outside any time block
      const isTimeBlockClick = target.closest('.fc-event');
      
      if (!isTimeBlockClick) {
        // Clear selection when clicking outside time blocks
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
    
    // Check for conflicts before updating (excluding the current event)
    if (checkTimeConflict(event.start, event.end, event.id)) {
      showConflictMessage('Cannot move/resize time block: Time slot is already occupied');
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

  // Function to handle time block completion with fireworks
  const handleCompleteTimeBlock = (timeBlockId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const timeBlock = timeBlocks.find(block => block.id === timeBlockId);
    if (!timeBlock) return;
    
    // 如果是标记为完成，显示烟花效果
    if (!timeBlock.completed) {
      // Get the position for fireworks
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Add fireworks effect
      const fireworkId = `firework-${Date.now()}`;
      setFireworks(prev => [...prev, { id: fireworkId, x, y }]);
      
      // Remove firework after animation
      setTimeout(() => {
        setFireworks(prev => prev.filter(f => f.id !== fireworkId));
      }, 1000);
    }
    
    // 切换完成状态而不是删除
    toggleTimeBlockCompletion(timeBlockId);
    setSelectedTimeBlockId(null);
  };

  // 🔥 关键修复：外部拖拽处理
  const handleDrop = (dropInfo: any) => {
    console.log('🎯 Drop event triggered:', dropInfo);
    
    // 阻止默认行为
    dropInfo.jsEvent.preventDefault();
    
    try {
      // 方法1：从拖拽事件的dataTransfer中获取数据
      let taskData = null;
      
      // 尝试从dataTransfer获取数据
      try {
        const transferData = dropInfo.jsEvent.dataTransfer?.getData('text/plain');
        if (transferData) {
          taskData = JSON.parse(transferData);
          console.log('📦 Got task data from dataTransfer:', taskData);
        }
      } catch (e) {
        console.log('⚠️ Failed to get data from dataTransfer:', e);
      }
      
      // 方法2：从拖拽元素的dataset获取数据
      if (!taskData && dropInfo.draggedEl?.dataset?.task) {
        try {
          taskData = JSON.parse(dropInfo.draggedEl.dataset.task);
          console.log('📦 Got task data from dataset:', taskData);
        } catch (e) {
          console.log('⚠️ Failed to get data from dataset:', e);
        }
      }
      
      // 方法3：从全局拖拽状态获取（如果有的话）
      if (!taskData) {
        console.log('❌ No task data found, checking global state...');
        return;
      }
      
      if (taskData && taskData.id) {
        console.log('✅ Processing task:', taskData.title);
        
        // 检查时间冲突
        const duration = taskData.estimatedDuration || 45;
        const endTime = addMinutes(dropInfo.date, duration);
        
        console.log('🕐 Checking conflict for:', dropInfo.date, 'to', endTime);
        
        if (checkTimeConflict(dropInfo.date, endTime)) {
          showConflictMessage('Cannot drop task: Time slot is already occupied');
          return;
        }
        
        // 转换任务为时间块
        console.log('🔄 Converting task to time block...');
        const success = convertTaskToTimeBlock(taskData.id, dropInfo.date);
        
        if (success) {
          console.log('🎉 Task converted successfully!');
        } else {
          showConflictMessage('Cannot convert task: Time conflict detected');
        }
      } else {
        console.log('❌ Invalid task data:', taskData);
      }
    } catch (error) {
      console.error('💥 Error in handleDrop:', error);
      showConflictMessage('Error processing dropped task');
    }
  };

  // 🔥 关键修复：拖拽进入处理
  const handleDragEnter = (info: any) => {
    console.log('🚪 Drag enter:', info);
    // 阻止默认行为，允许拖拽
    info.jsEvent.preventDefault();
    return false; // 返回false表示允许拖拽
  };

  // 🔥 关键修复：拖拽悬停处理
  const handleDragOver = (info: any) => {
    console.log('🔄 Drag over:', info);
    // 阻止默认行为，允许拖拽
    info.jsEvent.preventDefault();
    info.jsEvent.dataTransfer.dropEffect = 'move'; // 设置拖拽效果
    return false; // 返回false表示允许拖拽
  };

  const handleDragLeave = (info: any) => {
    console.log('🚪 Drag leave:', info);
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
          // 🔥 关键配置：启用外部拖拽
          droppable={true}
          dropAccept="*"
          // 🔥 关键配置：时间相关
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:15:00"
          snapDuration="00:05:00"
          // 🔥 关键配置：重叠和约束
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
          // 🔥 关键事件处理器
          dateClick={handleDateClick}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          // 🔥 关键拖拽事件处理器
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
                  className="editing-area h-full w-full flex flex-col overflow-hidden relative" 
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
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
                        e.stopPropagation(); // Prevent event bubbling
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveInlineEdit(info.event.id);
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleCancelInlineEdit();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
                      onMouseDown={(e) => e.stopPropagation()} // Prevent mousedown from bubbling
                      className="absolute inset-0 w-full h-full text-sm resize-none text-gray-900 dark:text-gray-100 focus:outline-none p-2 leading-relaxed bg-transparent border-none"
                      style={{
                        background: 'transparent',
                        boxShadow: 'none'
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
              <Tooltip content={shouldTruncate ? info.event.title : `${info.event.title} (Double-click to edit, Right-click for options, Drag edges to resize)`}>
                <div 
                  className={cn(
                    "h-full w-full p-2 overflow-hidden cursor-pointer transition-all duration-200 relative group",
                    isSelected && "ring-2 ring-blue-500 ring-inset",
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
                  {/* 完成状态覆盖层 */}
                  {isCompleted && (
                    <div className="absolute inset-0 bg-green-500/20 dark:bg-green-400/20 rounded-sm flex items-center justify-center">
                      <CheckCircle2 size={24} className="text-green-600 dark:text-green-400 opacity-60" />
                    </div>
                  )}
                  
                  {/* 完成/取消完成按钮 - 更大更明显 */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-md border-2",
                        isCompleted 
                          ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-400 opacity-90 hover:opacity-100" 
                          : "bg-green-500 hover:bg-green-600 text-white border-green-400 opacity-90 hover:opacity-100",
                        "group-hover:scale-110 hover:shadow-lg"
                      )}
                      onClick={(e) => handleCompleteTimeBlock(info.event.id, e)}
                      title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {isCompleted ? <RotateCcw size={14} /> : <Check size={14} />}
                    </button>
                  </div>
                  
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isCompleted 
                      ? "text-gray-500 dark:text-gray-400 line-through" 
                      : "text-gray-900 dark:text-gray-100"
                  )}>
                    {info.timeText}
                  </div>
                  <div 
                    className={cn(
                      "text-sm font-medium leading-tight pr-8",
                      isCompleted 
                        ? "text-gray-500 dark:text-gray-400 line-through" 
                        : "text-gray-900 dark:text-gray-100"
                    )}
                    title={shouldTruncate ? info.event.title : undefined}
                  >
                    {displayTitle}
                  </div>
                  
                  {/* 完成标记 */}
                  {isCompleted && (
                    <div className="absolute bottom-1 left-2 text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Completed
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
              'border-2 border-gray-800 dark:border-gray-200',
              'cursor-pointer',
              'transition-all duration-200',
              'fc-event-clean', // Custom class for clean rendering
              'group', // Add group class for hover effects
              isEditing 
                ? 'ring-2 ring-blue-500 shadow-lg transform scale-[1.02]' 
                : isSelected
                ? 'ring-2 ring-blue-400 shadow-md'
                : 'hover:shadow-md hover:transform hover:scale-[1.01]',
              // Enhanced background with gradient and completion state
              isCompleted
                ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                : isEditing
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

      {/* Fireworks Animation */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: firework.x - 25,
            top: firework.y - 25,
          }}
        >
          <div className="firework-container">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="firework-particle"
                style={{
                  '--angle': `${i * 45}deg`,
                  animationDelay: `${i * 0.1}s`
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/75 text-white text-xs px-3 py-2 rounded-md pointer-events-none">
        <div className="text-yellow-300 font-medium">📋 Instructions:</div>
        <div>Double-click: Create time block</div>
        <div>Double-click block: Edit</div>
        <div>Drag edges: Resize</div>
        <div>Drag center: Move</div>
        <div>Right-click: Delete</div>
        <div>Del key: Delete selected</div>
        <div className="text-green-300 mt-1 font-bold">✅ Click ✓ to complete!</div>
        <div className="text-orange-300 font-bold">🔄 Click ↻ to undo!</div>
        <div className="text-yellow-300">⚠️ Overlapping prevented</div>
      </div>

      {/* 🔥 完全移除进度条并启用拖拽的CSS */}
      <style jsx global>{`
        /* 🎯 关键：启用拖拽放置区域 */
        .fc-timegrid-body,
        .fc-timegrid-slots,
        .fc-timegrid-slot,
        .fc-timegrid-slot-lane {
          pointer-events: all !important;
        }
        
        /* 🎯 关键：拖拽悬停效果 */
        .fc-highlight {
          background: rgba(59, 130, 246, 0.15) !important;
          border: 2px dashed rgba(59, 130, 246, 0.6) !important;
          border-radius: 4px !important;
        }
        
        /* 🎯 关键：拖拽时的视觉反馈 */
        .fc-timegrid-slot:hover {
          background: rgba(59, 130, 246, 0.05) !important;
        }
        
        /* 彻底禁用所有进度条相关的渲染 */
        .fc-event,
        .fc-event *,
        .fc-event::before,
        .fc-event::after,
        .fc-event *::before,
        .fc-event *::after {
          background-image: none !important;
          background-size: 0 !important;
          background-position: 0 !important;
          background-repeat: no-repeat !important;
        }
        
        /* 强制移除FullCalendar的内置进度条 */
        .fc-event-main,
        .fc-event-main-frame,
        .fc-event-title-container,
        .fc-event-time,
        .fc-event-title {
          background: none !important;
          background-image: none !important;
          position: relative !important;
        }
        
        /* 移除所有可能的伪元素进度条 */
        .fc-event-main::after,
        .fc-event-main::before,
        .fc-event-main-frame::after,
        .fc-event-main-frame::before,
        .fc-event-title-container::after,
        .fc-event-title-container::before {
          display: none !important;
          content: none !important;
          background: none !important;
          background-image: none !important;
        }
        
        /* 确保编辑区域干净 */
        .editing-area,
        .editing-area *,
        .editing-area::before,
        .editing-area::after,
        .editing-area *::before,
        .editing-area *::after {
          background-image: none !important;
        }
        
        /* 启用调整大小功能 - 显示调整手柄 */
        .fc-event-resizer {
          display: block !important;
          position: absolute !important;
          z-index: 9999 !important;
          background: rgba(59, 130, 246, 0.8) !important;
          border: 1px solid rgba(59, 130, 246, 1) !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          cursor: ns-resize !important;
        }
        
        .fc-event-resizer-start {
          top: -4px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          cursor: n-resize !important;
        }
        
        .fc-event-resizer-end {
          bottom: -4px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          cursor: s-resize !important;
        }
        
        /* 悬停时显示调整手柄 */
        .fc-event:hover .fc-event-resizer {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .fc-event .fc-event-resizer {
          opacity: 0 !important;
          visibility: hidden !important;
          transition: opacity 0.2s ease !important;
        }
        
        /* 选中时显示调整手柄 */
        .fc-event.fc-event-selected .fc-event-resizer,
        .fc-event[class*="ring-2"] .fc-event-resizer {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* 移除任何可能的进度指示器，但保留调整手柄 */
        .fc-event .fc-event-bg {
          display: none !important;
        }
        
        /* 强制清理所有事件元素 */
        .fc-event-clean {
          background: none !important;
          background-image: none !important;
        }
        
        .fc-event-clean * {
          background: none !important;
          background-image: none !important;
        }
        
        /* 覆盖任何内联样式 */
        .fc-event[style*="background"],
        .fc-event[style*="linear-gradient"],
        .fc-event[style*="progress"] {
          background: none !important;
          background-image: none !important;
        }
        
        /* 确保textarea编辑器正常显示 - 移除明显的文本框样式 */
        .editing-area textarea {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1001 !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          resize: none !important;
        }
        
        /* 完全禁用FullCalendar的进度渲染系统 */
        .fc-event-main-frame .fc-event-title-container {
          overflow: hidden !important;
          background: none !important;
        }
        
        /* 移除所有可能导致进度条的CSS属性 */
        .fc-event * {
          background-attachment: initial !important;
          background-blend-mode: initial !important;
          background-clip: initial !important;
          background-color: transparent !important;
          background-image: none !important;
          background-origin: initial !important;
          background-position: initial !important;
          background-repeat: initial !important;
          background-size: initial !important;
        }
        
        /* 确保拖拽和调整大小时的视觉反馈 */
        .fc-event-dragging {
          opacity: 0.8 !important;
          transform: scale(1.05) !important;
          z-index: 1000 !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        }
        
        .fc-event-resizing {
          opacity: 0.9 !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
        }

        /* 烟花动画 */
        .firework-container {
          position: relative;
          width: 50px;
          height: 50px;
        }

        .firework-particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd);
          border-radius: 50%;
          animation: firework-explode 0.8s ease-out forwards;
          transform-origin: center;
        }

        @keyframes firework-explode {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-30px) scale(0);
            opacity: 0;
          }
        }

        /* 完成按钮增强样式 */
        .fc-event .group:hover button {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        /* 完成状态的时间块样式增强 */
        .fc-event.completed-timeblock {
          position: relative;
          overflow: visible;
        }
        
        .fc-event.completed-timeblock::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(34, 197, 94, 0.1) 10px,
            rgba(34, 197, 94, 0.1) 20px
          );
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>
    </div>
  );
}