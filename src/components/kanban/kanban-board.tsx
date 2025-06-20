'use client';

import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { SupportTicketStatus, SupportTicketPriority } from '@/prisma/generated';
import { getSupportTickets, updateTicketStatus } from '@/actions/support-tickets';
import { useQuery } from '@tanstack/react-query';


export type Status = SupportTicketStatus;
export type Priority = SupportTicketPriority;

const statusDescriptions: Record<Status, string> = {
  [SupportTicketStatus.New]: 'Ticket has been created but not yet reviewed.',
  [SupportTicketStatus.Acknowledged]: 'Support team has seen the ticket and confirmed receipt.',
  [SupportTicketStatus.Investigation]: 'Check what the issue is and make sure all the required documents/images/videos are present.',
  [SupportTicketStatus.Awaiting_Customer_Response]: 'Waiting for input or confirmation from the customer.',
  [SupportTicketStatus.In_Progress]: 'Work has started to resolve the issue - Engg has to be assigned first.',
  [SupportTicketStatus.Resolved]: 'Issue is fixed, pending customer confirmation. Should give feedback to the customer.',
  [SupportTicketStatus.Closed]: 'Customer has confirmed resolution or the time-out period has passed. Feedback has to be provided by the customer.'
};

const columns: { id: Status; title: string }[] = [
  { id: SupportTicketStatus.New, title: 'New' },
  { id: SupportTicketStatus.Acknowledged, title: 'Acknowledged' },
  { id: SupportTicketStatus.Investigation, title: 'Investigation' },
  { id: SupportTicketStatus.Awaiting_Customer_Response, title: 'Awaiting Customer' },
  { id: SupportTicketStatus.In_Progress, title: 'In Progress' },
  { id: SupportTicketStatus.Resolved, title: 'Resolved' },
  { id: SupportTicketStatus.Closed, title: 'Closed' }
];

interface KanbanBoardProps {
  filter: {
    priorities: Priority[];
    statuses: Status[];
    assignedTo: string;
  };
  filterType: 'status' | 'priority' ;
}

export type KanbanTask = {
  id: string;
  title: string;
  status: Status;
  description?: string;
  priority?: Priority;
  assignedTo?: { id: string; name: string; email: string }[];
};

export function KanbanBoard({ filter, filterType }: KanbanBoardProps) {
  const { priorities, statuses } = filter;
  const {
    data: tasksData = [],
    isLoading,
    // refetch
  } = useQuery({
    queryKey: ['supportTickets', priorities, statuses],
    queryFn: async () => {
      const fetchedTasks = await getSupportTickets({ priorities, statuses });
      return fetchedTasks.map(task => ({
        ...task,
        assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : []
      }));
    }
  });
  const [tasks, setTasks] = useState<KanbanTask[]>(tasksData);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  // Keep local tasks in sync with query data
  useEffect(() => {
    setTasks(tasksData);
  }, [tasksData]);

  useEffect(() => {
    async function fetchData() {
      const { priorities, statuses } = filter;
      const fetchedTasks = await getSupportTickets({ priorities, statuses });
      setTasks(fetchedTasks.map(task => ({
        ...task,
        assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : []
      })));
    }
    fetchData();
  }, [filter]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task as KanbanTask);
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


    updateTicketStatus(activeTask.id, overTask.status)
    .then(updatedTask => {
      if (!updatedTask) {
        console.error(`Failed to update status for task ${activeTask.id} in DB. Reverting UI (optional).`);
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === activeTask.id ? { ...task, status: activeTask.status, assignedTo: task.assignedTo ?? [] } : { ...task, assignedTo: task.assignedTo ?? [] }
          )
        );
      }
    })
    .catch(error => {
      console.error("Error calling updateTicketStatus:", error);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === activeTask.id ? { ...task, status: activeTask.status, assignedTo: task.assignedTo ?? [] } : { ...task, assignedTo: task.assignedTo ?? [] }
        )
      );
    });
    }

    setActiveTask(null);
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id) as Status;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    if (!columns.find(col => col.id === overId)) return;
    if (overId === activeTask.status) return;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === activeId ? { ...task, status: overId, assignedTo: task.assignedTo ?? [] } : { ...task, assignedTo: task.assignedTo ?? [] }
      )
    );

  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="p-8 text-center">No tasks found.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-200 mx-4 my-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="relative overflow-x-auto">
          <div className="flex gap-5 p-2 min-h-[600px]" style={{ minWidth: columns.length * 320 }}>
            {filterType === 'status' ? (
              columns
                .filter((column) => filter.statuses.includes(column.id))
                .map((column) => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    description={statusDescriptions[column.id]}
                    tasks={tasks.filter((task) =>
                      task.status === column.id &&
                      (!filter.assignedTo || (task.assignedTo && task.assignedTo.some(member => member.name.toLowerCase().includes(filter.assignedTo.toLowerCase()))))
                    )}
                  />
                ))
            ) : (
              columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  description={statusDescriptions[column.id]}
                  tasks={tasks.filter((task) =>
                    task.status === column.id &&
                    filter.priorities.includes(task.priority || SupportTicketPriority.Low) &&
                    (!filter.assignedTo || (task.assignedTo && task.assignedTo.some(member => member.name.toLowerCase().includes(filter.assignedTo.toLowerCase()))))
                  )}
                />
              ))
            )}
          </div>
        </div>

        <DragOverlay>
          {activeTask && <KanbanCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
