'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Status } from './kanban-board';

type Task = {
  id: string;
  title: string;
  status: Status;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
};

type KanbanCardProps = {
  task: Task;
};

export function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card p-4 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow"
    >
      <h3 className="font-medium mb-2">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
      )}
      {task.priority && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>
      )}
    </div>
  );
}