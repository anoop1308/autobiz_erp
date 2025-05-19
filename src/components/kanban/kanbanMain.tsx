'use client';

import { useState } from 'react';
import { KanbanBoard } from './kanban-board';
import { KanbanFilter } from './kanban-filter';
import { SupportTicketPriority, SupportTicketStatus } from '@/prisma/generated';

type Status = SupportTicketStatus;
type Priority = SupportTicketPriority;
type FilterType = 'status' | 'priority';

export function KanbanMain() {
  const [filterType, setFilterType] = useState<FilterType>('status');
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([
    SupportTicketStatus.New,
    SupportTicketStatus.Acknowledged,
    SupportTicketStatus.Investigation,
    SupportTicketStatus.Awaiting_Customer_Response,
    SupportTicketStatus.In_Progress,
    SupportTicketStatus.Resolved,
    SupportTicketStatus.Closed,
  ]);

  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>([
    SupportTicketPriority.Low,
    SupportTicketPriority.Medium,
    SupportTicketPriority.High,
  ]);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [filterObj, setFilterObj] = useState<{ priorities: Priority[]; statuses: Status[]; assignedTo: string }>({
    priorities: [
      SupportTicketPriority.Low,
      SupportTicketPriority.Medium,
      SupportTicketPriority.High,
    ],
    statuses: [
      SupportTicketStatus.New,
      SupportTicketStatus.Acknowledged,
      SupportTicketStatus.Investigation,
      SupportTicketStatus.Awaiting_Customer_Response,
      SupportTicketStatus.In_Progress,
      SupportTicketStatus.Resolved,
      SupportTicketStatus.Closed,
    ],
    assignedTo: '',
  });

  return (
    <div className="py-8 px-5">
      <div className='flex gap-5 w-1/2'>
        <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>
        <KanbanFilter
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          selectedStatuses={selectedStatuses}
          onStatusChange={setSelectedStatuses}
          selectedPriorities={selectedPriorities}
          onPriorityChange={setSelectedPriorities}
          assignedTo={assignedTo}
          onAssignedToChange={setAssignedTo}
          onApplyFilter={(filter) => setFilterObj(filter)}
        />
      </div>
      <KanbanBoard
        filter={filterObj}
        filterType={filterType}
      />
    </div>
  );
}