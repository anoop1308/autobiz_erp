'use server';
import { auth, prisma } from '@/lib/auth';
import { SupportTicketPriority, SupportTicketStatus } from '@/prisma/generated';
import { headers } from 'next/headers';

export interface KanbanTask {
  id: string;
  title: string;
  status: SupportTicketStatus;
  description?: string;
  priority?: SupportTicketPriority;
  assignedTo?: { id: string; name: string; email: string; }[];
}

export async function getSupportTickets(filter?: {
  priorities?: SupportTicketPriority[];
  statuses?: SupportTicketStatus[];
  assignedTo?: string;
}): Promise<KanbanTask[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return [];
  try {
    const where: any = {};
    if (filter) {
      if (filter.priorities && filter.priorities.length > 0) {
        where.priority = { in: filter.priorities };
      }
      if (filter.statuses && filter.statuses.length > 0) {
        where.status = { in: filter.statuses };
      }
      // if (Array.isArray(filter.assignedTo) && filter.assignedTo.length > 0) {
      //   where.assignedTo = {
      //     some: {
      //       user: {
      //         id: { in: filter.assignedTo },
      //       }
      //     }
      //   };
      // }
    }
    where.organizationId = activeOrgId;
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        assignedTo: {
          include: {
            user: true
          }
        },
      },
    });

    return tickets.map(ticket => ({
      id: ticket.id,
      title: ticket.issueType,
      status: ticket.status,
      description: ticket.description,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo.map(member => ({
        id: member.id,
        name: member.user.name,
        email: member.user.email
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch support tickets:', error);
    return [];
  }
}

export async function updateTicketStatus(ticketId: string, newStatus: SupportTicketStatus): Promise<KanbanTask | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const user = session?.user.name;

    const prevTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!prevTicket) throw new Error('Ticket not found');

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });

    await prisma.supportTicketHistory.create({
      data: {
        supportTicketId: ticketId,
        createdAt: new Date(),
        beforeStatus: prevTicket.status,
        afterStatus: newStatus,
        changedBy: user,
      },
    });
    
    return {
      id: updatedTicket.id,
      title: updatedTicket.issueType,
      status: updatedTicket.status,
      description: updatedTicket.description,
      priority: updatedTicket.priority,
    };
  } catch (error) {
    console.error(`Failed to update status for ticket ${ticketId}:`, error);
    return null;
  }
}

export async function updateTicketPriority(ticketId: string, newPriority: SupportTicketPriority): Promise<KanbanTask | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const user = session?.user.name;

    const prevTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!prevTicket) throw new Error('Ticket not found');

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority: newPriority },
    });

    await prisma.supportTicketHistory.create({
      data: {
        supportTicketId: ticketId,
        createdAt: new Date(),
        beforePriority: prevTicket.priority,
        afterPriority: newPriority,
        changedBy: user,
      },
    });

    return {
      id: updatedTicket.id,
      title: updatedTicket.issueType,
      status: updatedTicket.status,
      description: updatedTicket.description,
      priority: updatedTicket.priority,
    };
  } catch (error) {
    console.error(`Failed to update priority for ticket ${ticketId}:`, error);
    return null;
  }
}