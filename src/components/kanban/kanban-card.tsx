'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Status } from './kanban-board';
import { SupportTicketPriority } from '@/prisma/generated';
import { History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { updateTicketPriority } from '@/actions/support-tickets';
import { getEngineerTeamMembers } from '@/actions/team-members';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { useQuery, useMutation } from '@tanstack/react-query';

type Task = {
  id: string;
  title: string;
  status: Status;
  description?: string;
  priority?: SupportTicketPriority;
  assignedTo?: { id: string; name: string; email: string }[];
};

export interface History {
  id: string
  supportTicketId: string
  beforeStatus: string
  afterStatus: string
  beforePriority: string
  afterPriority: string
  changedBy: string
  createdAt: string
}


type KanbanCardProps = {
  task: Task;
};

const fetchHistory = async (ticketId: string) => {
  const res = await fetch(`/api/support/history?ticketId=${ticketId}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = await res.json();
  return data.history;
};

const assignMembers = async ({ ticketId, memberIds }: { ticketId: string; memberIds: string[] }) => {
  const response = await fetch('/api/support/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId, memberIds })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'An error occurred while assigning members');
  }
  return response.json();
};

export interface History {
  id: string
  supportTicketId: string
  beforeStatus: string
  afterStatus: string
  beforePriority: string
  afterPriority: string
  changedBy: string
  createdAt: string
}


export function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const [priority, setPriority] = useState(task.priority);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignedMembers, setAssignedMembers] = useState<{ id: string; name: string; email: string }[]>(task.assignedTo || []);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800',
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as SupportTicketPriority;
    setIsUpdating(true);
    setPriority(newPriority);
    const updated = await updateTicketPriority(task.id, newPriority);
    if (!updated) {
      setPriority(task.priority);
    }
    setIsUpdating(false);
  };

  const isAssigned = (memberId: string) =>
    assignedMembers.some((m) => m.id === memberId);

  const {
    data: history = [],
    isLoading: loadingHistory,
    // refetch: refetchHistory
  } = useQuery({
    queryKey: ['ticketHistory', task.id],
    queryFn: () => fetchHistory(task.id),
    enabled: showHistory
  });

  const mutation = useMutation({
    mutationFn: assignMembers,
    onSuccess: (data) => {
      setAssignedMembers(data.assignedTo || []);
      toast({ title: 'Success', description: 'Members assigned successfully' });
      setIsPopoverOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Failed to assign members', description: error.message, variant: 'destructive' });
    },
    onSettled: () => setAssignLoading(false)
  });

  const toggleAssignment = (memberId: string) => {
    setAssignLoading(true);
    const updatedIds = isAssigned(memberId)
      ? assignedMembers.filter((m) => m.id !== memberId).map((m) => m.id)
      : [...assignedMembers.map((m) => m.id), memberId];
    mutation.mutate({ ticketId: task.id, memberIds: updatedIds });
  };

  useEffect(() => {
    async function fetchTeamMembers() {
      setLoadingMembers(true);
      try {
        const members = await getEngineerTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
      setLoadingMembers(false);
    }
    fetchTeamMembers();
  }, []);

  return (
    <>
      <Link href={`/tickets/${task.id}`}>
        <Card>
          <CardContent
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{task.title}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowHistory(true);
                }}
                onPointerDown={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <select
                id={`priority-${task.id}`}
                value={priority}
                onChange={handlePriorityChange}
                disabled={isUpdating}
                className={`text-xs px-2 py-1 rounded-full border ${priorityColors[priority ?? 'Low']} focus:outline-none`}
              >
                {Object.values(SupportTicketPriority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {isUpdating && <span className="text-xs text-gray-400 ml-2">Updating...</span>}
            </div>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className='text-xs' onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}>Assign To</Button>
              </PopoverTrigger>
              <PopoverContent className='w-64 p-2'>
                <p className='text-sm font-medium mb-2'>Assign to Engineers</p>
                {loadingMembers ? (
                  <p className="text-xs text-muted-foreground">Loading team members...</p>
                ) : (
                  <div className='space-y-2 max-h-48 overflow-y-auto'>
                    {teamMembers.map((member) => (
                      <div key={member.id} className='flex items-center gap-2'>
                        <Checkbox
                          id={`assign-${task.id}-${member.id}`}
                          checked={isAssigned(member.id)}
                          onCheckedChange={() => toggleAssignment(member.id)}
                          disabled={assignLoading}
                        />
                        <Label htmlFor={`assign-${task.id}-${member.id}`} className='text-sm leading-none'>{member.name}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </CardContent>

        </Card>
      </Link>

      <Drawer open={showHistory} onOpenChange={setShowHistory} direction="right">
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle>Ticket History</DrawerTitle>
            <DrawerDescription>All changes made to this ticket</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {loadingHistory ? (
              <div>Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-muted-foreground text-sm">No history found.</div>
            ) : (
              history.map((h, i) => (
                <div key={h.id || i} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                  {i === 0 && (
                    <div>
                      <span className="font-medium">Ticket created by: </span><span className="font-semibold">{h.changedBy || 'Unknown'}</span> <span className="text-xs">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  {h.beforeStatus && h.afterStatus && h.beforeStatus !== h.afterStatus && (
                    <div>
                      <span className="font-medium">Status changed: </span><span className="font-mono">{h.beforeStatus}</span> -&gt; <span className="font-mono">{h.afterStatus}</span> by <span className="font-semibold">{h.changedBy || 'Unknown'}</span> <span className="text-xs">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                  {h.beforePriority && h.afterPriority && h.beforePriority !== h.afterPriority && (
                    <div>
                      <span className="font-medium">Priority changed: </span><span className={`font-mono ${priorityColors[h.beforePriority as keyof typeof priorityColors]}`}>{h.beforePriority}</span> -&gt; <span className={`font-mono ${priorityColors[h.afterPriority as keyof typeof priorityColors]}`}>{h.afterPriority}</span> by <span className="font-semibold">{h.changedBy || 'Unknown'}</span> <span className="text-xs">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}