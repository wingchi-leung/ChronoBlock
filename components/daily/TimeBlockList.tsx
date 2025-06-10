"use client";

import { useStore } from '@/lib/store';
import { TimeBlock } from '@/types';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { Clock, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import TimeBlockEditor from '@/components/TimeBlockEditor';

interface TimeBlockListProps {
  timeBlocks: TimeBlock[];
  selectedDate: Date;
}

export default function TimeBlockList({ timeBlocks, selectedDate }: TimeBlockListProps) {
  const { updateTimeBlock, deleteTimeBlock, addTimeBlock, checkTimeConflict } = useStore();
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);
  const [editorPosition, setEditorPosition] = useState({ top: 0, left: 0 });
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  
  const handleAddTimeBlock = () => {
    // Create a new time block at 9am on the selected day
    const date = new Date(selectedDate);
    date.setHours(9, 0, 0, 0);
    
    // Check for conflicts before creating
    const endTime = new Date(date);
    endTime.setMinutes(date.getMinutes() + 30); // 30 minutes default
    
    if (checkTimeConflict(date, endTime)) {
      setConflictMessage('Cannot create time block: 9:00 AM slot is already occupied');
      setTimeout(() => setConflictMessage(null), 3000);
      return;
    }
    
    const newBlock = addTimeBlock(date);
    if (!newBlock) {
      setConflictMessage('Cannot create time block: Time conflict detected');
      setTimeout(() => setConflictMessage(null), 3000);
    }
  };
  
  const handleEditTimeBlock = (timeBlock: TimeBlock, e: React.MouseEvent) => {
    setEditingTimeBlock(timeBlock);
    
    setEditorPosition({
      top: e.clientY,
      left: e.clientX
    });
  };
  
  const handleSaveTimeBlock = (updatedTimeBlock: TimeBlock) => {
    updateTimeBlock(updatedTimeBlock.id, {
      title: updatedTimeBlock.title
    });
    setEditingTimeBlock(null);
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Clock size={16} />
          Time Blocks
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTimeBlock}
          className="h-8 px-2 flex items-center gap-1"
        >
          <Plus size={14} />
          <span>Add</span>
        </Button>
      </div>
      
      {/* Conflict Message */}
      {conflictMessage && (
        <div className="mx-4 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <AlertTriangle size={16} />
          {conflictMessage}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        {timeBlocks.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 p-4 text-muted-foreground">
            <p className="text-center text-sm">No time blocks for this day</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTimeBlock}
              className="mt-2"
            >
              Create a Time Block
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {timeBlocks.map((timeBlock) => {
              const startTime = new Date(timeBlock.start);
              const endTime = new Date(timeBlock.end);
              const duration = differenceInMinutes(endTime, startTime);
              
              return (
                <div 
                  key={timeBlock.id}
                  className="group p-3 border-2 border-gray-800 dark:border-gray-200 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  style={{ 
                    boxShadow: '3px 3px 0 rgba(0, 0, 0, 0.1)',
                  }}
                  onDoubleClick={(e) => handleEditTimeBlock(timeBlock, e)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{timeBlock.title}</p>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTimeBlock(timeBlock, e);
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTimeBlock(timeBlock.id);
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground font-mono">
                    <span>{format(startTime, 'HH:mm')}</span>
                    <span className="mx-1">-</span>
                    <span>{format(endTime, 'HH:mm')}</span>
                    <span className="ml-auto">{duration} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {editingTimeBlock && (
        <TimeBlockEditor
          timeBlock={editingTimeBlock}
          onSave={handleSaveTimeBlock}
          onCancel={() => setEditingTimeBlock(null)}
          position={editorPosition}
        />
      )}
    </div>
  );
}