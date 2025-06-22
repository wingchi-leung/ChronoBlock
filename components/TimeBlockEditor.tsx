"use client";

import { useState, useEffect, useRef } from 'react';
import { TimeBlock } from '@/types';

interface TimeBlockEditorProps {
  timeBlock: TimeBlock;
  onSave: (timeBlock: TimeBlock) => void;
  onCancel: () => void;
  position: { top: number; left: number };
}

export default function TimeBlockEditor({ 
  timeBlock, 
  onSave, 
  onCancel,
  position
}: TimeBlockEditorProps) {
  const [title, setTitle] = useState(timeBlock.title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    
    // Add event listener to handle clicks outside the editor
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSave = () => {
    onSave({
      ...timeBlock,
      title
    });
    // Explicitly blur the input to remove focus
    inputRef.current?.blur();
  };
  
  const handleCancel = () => {
    // Explicitly blur the input to remove focus
    inputRef.current?.blur();
    onCancel();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  return (
    <div 
      className="absolute z-50 bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700 p-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}