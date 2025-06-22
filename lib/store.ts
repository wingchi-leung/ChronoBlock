import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { TimeBlock, Task, View } from '@/types';
import { addMinutes, isWithinInterval, areIntervalsOverlapping } from 'date-fns';

interface State {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  currentView: View;
  addTask: (title: string, description?: string, estimatedDuration?: number) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addTimeBlock: (start: Date, end?: Date, title?: string) => TimeBlock | null;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => boolean;
  deleteTimeBlock: (id: string) => void;
  convertTaskToTimeBlock: (taskId: string, start: Date) => boolean;
  setCurrentView: (view: View) => void;
  checkTimeConflict: (start: Date, end: Date, excludeId?: string) => boolean;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: [],
      timeBlocks: [],
      currentView: 'calendar',
      
      addTask: (title, description = '', estimatedDuration) => set((state) => ({
        tasks: [...state.tasks, {
          id: uuidv4(),
          title,
          description,
          completed: false,
          estimatedDuration,
          createdAt: new Date()
        }]
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      
      toggleTaskCompletion: (id) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      })),
      
      // Check if a time range conflicts with existing time blocks
      checkTimeConflict: (start, end, excludeId) => {
        const { timeBlocks } = get();
        return timeBlocks.some(block => {
          if (excludeId && block.id === excludeId) return false;
          return areIntervalsOverlapping(
            { start: new Date(block.start), end: new Date(block.end) },
            { start, end },
            { inclusive: false } // Don't consider touching intervals as overlapping
          );
        });
      },
      
      addTimeBlock: (start, end, title = 'New Time Block') => {
        // Increase default duration to 45 minutes for better visibility
        const endTime = end || addMinutes(start, 45);
        
        // Check for conflicts
        if (get().checkTimeConflict(start, endTime)) {
          return null; // Return null if there's a conflict
        }
        
        const newTimeBlock = {
          id: uuidv4(),
          title,
          start,
          end: endTime,
          editable: true
        };
        
        set((state) => ({
          timeBlocks: [...state.timeBlocks, newTimeBlock]
        }));
        
        return newTimeBlock;
      },
      
      updateTimeBlock: (id, updates) => {
        const { timeBlocks, checkTimeConflict } = get();
        const currentBlock = timeBlocks.find(block => block.id === id);
        if (!currentBlock) return false;
        
        // If updating time, check for conflicts
        if (updates.start || updates.end) {
          const newStart = updates.start || currentBlock.start;
          const newEnd = updates.end || currentBlock.end;
          
          if (checkTimeConflict(newStart, newEnd, id)) {
            return false; // Return false if there's a conflict
          }
        }
        
        set((state) => ({
          timeBlocks: state.timeBlocks.map(block => 
            block.id === id ? { ...block, ...updates } : block
          )
        }));
        
        return true;
      },
      
      deleteTimeBlock: (id) => set((state) => ({
        timeBlocks: state.timeBlocks.filter(block => block.id !== id)
      })),
      
      convertTaskToTimeBlock: (taskId, start) => {
        const { tasks, checkTimeConflict } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return false;
        
        const duration = task.estimatedDuration || 45; // Increased default duration
        const end = addMinutes(start, duration);
        
        // Check for conflicts
        if (checkTimeConflict(start, end)) {
          return false; // Return false if there's a conflict
        }
        
        const newTimeBlock = {
          id: uuidv4(),
          title: task.title,
          start,
          end,
          color: task.color,
          editable: true
        };
        
        set((state) => ({
          timeBlocks: [...state.timeBlocks, newTimeBlock],
          tasks: state.tasks.filter(t => t.id !== taskId)
        }));
        
        return true;
      },
      
      setCurrentView: (view) => set({ currentView: view })
    }),
    {
      name: 'chronoblock-storage'
    }
  )
);