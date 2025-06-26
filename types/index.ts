export interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  editable?: boolean;
  completed?: boolean; // 新增完成状态
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  color?: string;
  estimatedDuration?: number; // in minutes
  createdAt: Date;
}

export type View = 'calendar' | 'daily';