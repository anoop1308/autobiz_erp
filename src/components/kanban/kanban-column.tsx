'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import { SupportTicketPriority, SupportTicketStatus } from '../../prisma/generated';

type Task = {
  id: string;
  title: string;
  status: SupportTicketStatus;
  description?: string;
  priority?: SupportTicketPriority;
};

type KanbanColumnProps = {
  id: SupportTicketStatus;
  title: string;
  tasks: Task[];
  description: string;
};

export function KanbanColumn({ id, title, tasks, description }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-[500px]">
      <div className="bg-background p-4 rounded-lg shadow-sm">
        <div 
          className="relative" 
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <h2 className="font-semibold text-lg mb-4 cursor-help">{title}</h2>
          {showTooltip && (
            <div className="absolute z-50 p-2 bg-black/80 text-white text-sm rounded-md shadow-lg max-w-xs -top-2 left-full ml-2">
              {description}
            </div>
          )}
        </div>
        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 min-h-[200px] p-2 bg-muted/50 rounded-md"
        >
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}