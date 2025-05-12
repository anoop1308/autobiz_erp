'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';

export type Status = 'new' | 'acknowledged' | 'investigation' | 'awaiting-customer-response' | 'in-progress' | 'resolved' | 'closed' | 'reopened';

type Task = {
  id: string;
  title: string;
  status: Status;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
};

const statusDescriptions = {
  'new': 'Ticket has been created but not yet reviewed.',
  'acknowledged': 'Support team has seen the ticket and confirmed receipt.',
  'investigation': 'Check what the issue is and make sure all the required documents/images/videos are present.',
  'awaiting-customer-response': 'Waiting for input or confirmation from the customer.',
  'in-progress': 'Work has started to resolve the issue - Engg has to be assigned first.',
  'resolved': 'Issue is fixed, pending customer confirmation. Should give feedback to the customer.',
  'closed': 'Customer has confirmed resolution or the time-out period has passed. Feedback has to be provided by the customer.',
  'reopened': 'Customer has reactivated the ticket after closure due to unresolved issues.'
};

const defaultTasks: Task[] = [
  { id: '1', title: 'Task 1', status: 'new', priority: 'high' },
  { id: '2', title: 'Task 2', status: 'in-progress', priority: 'medium' },
  { id: '3', title: 'Task 3', status: 'resolved', priority: 'low' },
];

const columns: { id: Status; title: string }[] = [
  { id: 'new', title: 'New' },
  { id: 'acknowledged', title: 'Acknowledged' },
  { id: 'investigation', title: 'Investigation' },
  { id: 'awaiting-customer-response', title: 'Awaiting Customer' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
  { id: 'closed', title: 'Closed' },
  { id: 'reopened', title: 'Reopened' }
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);

    if (!activeTask || !overTask) return;

    const activeIndex = tasks.findIndex((t) => t.id === active.id);
    const overIndex = tasks.findIndex((t) => t.id === over.id);

    if (activeIndex !== overIndex) {
      setTasks((tasks) => arrayMove(tasks, activeIndex, overIndex));
    }

    setActiveTask(null);
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = String(over.id) as Status;
    if (!columns.find(col => col.id === overId)) return;
    if (overId === activeTask.status) return;

    setTasks(tasks =>
      tasks.map(task =>
        task.id === active.id ? { ...task, status: overId } : task
      )
    );
  };

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="flex gap-4 overflow-x-auto p-2">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              description={statusDescriptions[column.id]}
              tasks={tasks.filter((task) => task.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <KanbanCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}