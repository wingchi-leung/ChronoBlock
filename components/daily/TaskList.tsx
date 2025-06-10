"use client";

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/types';
import { format } from 'date-fns';
import { ListTodo, Edit, Trash2, Plus, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TaskListProps {
  selectedDate: Date;
}

export default function TaskList({ selectedDate }: TaskListProps) {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <ListTodo size={16} />
          Tasks
        </h3>
      </div>
      
      <form onSubmit={handleAddTask} className="p-4 border-b border-border flex gap-2">
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
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 text-muted-foreground">
            <p className="text-center text-sm">No tasks yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.focus()}
              className="mt-2"
            >
              Create a Task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className="group flex items-start gap-2 p-3 border-2 border-dashed border-gray-600 dark:border-gray-400 rounded-md bg-white dark:bg-gray-900 cursor-move"
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
                      "h-6 w-6 mt-0.5 rounded-full border border-input",
                      task.completed ? "bg-primary border-primary" : "bg-background"
                    )}
                  >
                    {task.completed && <Check size={12} className="text-primary-foreground" />}
                  </Button>
                  
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    
                    {task.estimatedDuration && (
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        <span>{task.estimatedDuration} min</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditing(task);
                      }}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <Edit size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}