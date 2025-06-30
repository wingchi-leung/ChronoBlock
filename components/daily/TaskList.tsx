"use client";

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/types';
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
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.dataset.task = JSON.stringify(task);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="section-padding py-4 border-b-2 border-current flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2 font-mono">
          <ListTodo size={16} />
          Tasks
        </h3>
      </div>
      
      <form onSubmit={handleAddTask} className="section-padding py-4 border-b border-current/20 flex gap-3">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="input-sketch flex-1 text-sm h-10"
        />
        <button type="submit" className="btn-sketch w-10 h-10 p-0 flex items-center justify-center">
          <Plus size={16} />
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto scrollbar-custom section-padding py-4 space-y-4">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-4 text-muted-foreground">
            <div className="w-16 h-16 border-2 border-dashed border-current flex items-center justify-center">
              <ListTodo size={24} />
            </div>
            <p className="text-center text-sm">No tasks yet</p>
            <button
              onClick={() => inputRef.current?.focus()}
              className="btn-sketch px-4 py-2 text-sm"
            >
              Create a Task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className="group card-sketch p-4 cursor-move hover:shadow-lg transition-all duration-300"
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
            >
              {editingTaskId === task.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                    onBlur={() => handleSaveEdit(task.id)}
                    className="input-sketch flex-1 text-sm h-8"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="w-8 h-8 border border-current hover:bg-muted flex items-center justify-center"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="w-8 h-8 border border-current hover:bg-muted flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={cn(
                        "w-6 h-6 mt-0.5 border-2 border-current flex items-center justify-center transition-all",
                        task.completed ? "bg-foreground text-background" : "bg-transparent hover:bg-muted"
                      )}
                    >
                      {task.completed && <Check size={14} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      
                      {task.estimatedDuration && (
                        <div className="flex items-center mt-2 text-xs text-muted-foreground font-mono">
                          <Clock size={12} className="mr-1" />
                          <span>{task.estimatedDuration} min</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditing(task);
                        }}
                        className="w-8 h-8 border border-current hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="w-8 h-8 border border-current hover:bg-red-50 dark:hover:bg-red-950 flex items-center justify-center text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Drag indicator */}
                  <div className="mt-3 pt-3 border-t border-dashed border-current/30 text-xs text-muted-foreground font-mono text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Drag to calendar to schedule
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