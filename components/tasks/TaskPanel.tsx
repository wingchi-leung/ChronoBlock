"use client";

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Check, Edit, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function TaskPanel() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
      inputRef.current?.focus();
    }
  };

  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditValue(task.title);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 50);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      updateTask(id, { title: editValue.trim() });
    }
    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add task data to the dragged element for easier access
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.dataset.task = JSON.stringify(task);
    }
  };

  return (
    <div className={cn(
      "border-l border-border h-full transition-all duration-300 bg-card",
      isExpanded ? "w-80" : "w-10"
    )}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className={cn("font-medium", !isExpanded && "hidden")}>Tasks</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7"
          >
            {isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {isExpanded && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <form onSubmit={handleAddTask} className="p-3 border-b border-border flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 text-sm h-8"
              />
              <Button type="submit" size="sm" variant="outline" className="h-8 w-8 p-0">
                <Plus size={14} />
              </Button>
            </form>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </div>
              
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tasks yet</p>
                  <p className="text-xs mt-1">Create a task or drag to calendar</p>
                </div>
              )}
              
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="group flex items-center gap-2 p-2 border border-border rounded-md bg-white dark:bg-gray-900 cursor-move hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  style={{ 
                    boxShadow: '2px 2px 0 rgba(0, 0, 0, 0.1)',
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                >
                  {editingTaskId === task.id ? (
                    <div className="flex-1 flex items-center">
                      <Input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, task.id)}
                        onBlur={() => handleSaveEdit(task.id)}
                        className="flex-1 text-sm h-7 py-1"
                        autoFocus
                      />
                      <div className="flex ml-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(task.id)}
                          className="h-6 w-6"
                        >
                          <Check size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          className="h-6 w-6"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={cn(
                          "h-6 w-6 rounded-full border border-input",
                          task.completed ? "bg-primary border-primary" : "bg-background"
                        )}
                      >
                        {task.completed && <Check size={12} className="text-primary-foreground" />}
                      </Button>
                      <span 
                        className={cn(
                          "flex-1 text-sm", 
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEditing(task)}
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}