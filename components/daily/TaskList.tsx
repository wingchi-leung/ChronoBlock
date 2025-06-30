"use client";

import { useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Task } from '@/types';
import { ListTodo, Edit, Trash2, Plus, Check, X, Clock, Sparkles } from 'lucide-react';
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
      <div className="section-padding py-6 border-b-3 border-current flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-3 font-mono text-xl">
          <ListTodo size={20} className="text-accent" />
          Tasks
          <Sparkles size={16} className="text-accent animate-pulse-enhanced" />
        </h3>
      </div>
      
      <form onSubmit={handleAddTask} className="section-padding py-6 border-b-2 border-current/20 flex gap-4">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="input-sketch flex-1 h-12 text-base"
        />
        <button type="submit" className="btn-sketch w-12 h-12 p-0 flex items-center justify-center magnetic-button">
          <Plus size={18} />
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto scrollbar-custom section-padding py-6 space-y-6">
        {tasks.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-6 text-muted-foreground">
            <div className="w-20 h-20 border-3 border-dashed border-current flex items-center justify-center magnetic animate-float">
              <ListTodo size={32} />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold">No tasks yet</p>
              <p className="text-sm">Create your first task to get started</p>
            </div>
            <button
              onClick={() => inputRef.current?.focus()}
              className="btn-sketch px-6 py-3 text-base magnetic-button"
            >
              Create a Task
            </button>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div 
              key={task.id}
              className="group card-sketch card-3d p-6 cursor-move hover:shadow-lg transition-all duration-300 magnetic"
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {editingTaskId === task.id ? (
                <div className="flex items-center gap-3">
                  <Input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, task.id)}
                    onBlur={() => handleSaveEdit(task.id)}
                    className="input-sketch flex-1 h-10"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(task.id)}
                      className="w-10 h-10 border-2 border-current hover:bg-muted flex items-center justify-center magnetic"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="w-10 h-10 border-2 border-current hover:bg-muted flex items-center justify-center magnetic"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={cn(
                        "w-8 h-8 mt-1 border-3 border-current flex items-center justify-center transition-all duration-300 magnetic",
                        task.completed ? "bg-foreground text-background" : "bg-transparent hover:bg-muted"
                      )}
                    >
                      {task.completed && <Check size={16} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-base font-semibold leading-relaxed",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      
                      {task.estimatedDuration && (
                        <div className="flex items-center mt-3 text-sm text-muted-foreground font-mono">
                          <Clock size={14} className="mr-2" />
                          <span>{task.estimatedDuration} min</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditing(task);
                        }}
                        className="w-10 h-10 border-2 border-current hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground magnetic"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="w-10 h-10 border-2 border-current hover:bg-red-50 dark:hover:bg-red-950 flex items-center justify-center text-muted-foreground hover:text-red-600 magnetic"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Enhanced drag indicator */}
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-current/30 text-sm text-muted-foreground font-mono text-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-accent animate-pulse-enhanced"></div>
                      <span>Drag to calendar to schedule</span>
                      <div className="w-2 h-2 bg-accent animate-pulse-enhanced" style={{ animationDelay: '0.5s' }}></div>
                    </div>
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