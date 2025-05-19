'use server';

import { auth, prisma } from "@/lib/auth";
import { headers } from "next/headers";

export async function getTicketsList() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return [];

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        organizationId: activeOrgId,
      },
      include: {
        assignedTo: true,
      },
    })
    return tickets.map((ticket) => ({
      id: ticket.id,
      customerName: ticket.customerName,
      description: ticket.description,
      product: ticket.product,
      status: ticket.status,
      priority: ticket.priority,
    }))
  } catch (error) {
    console.log('Error in fetching tickets: ', error);
    return [];
  }
}

export async function getTicket(ticketId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return null;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
        organizationId: activeOrgId,
      },
      include: {
        assignedTo: true,
        history: true,
      },
    });
    return ticket;
  } catch (error) {
    console.log('Error in fetching ticket: ', error);
    return null;
  }
}

export async function updateTicket(ticketId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const activeOrgId = session?.session.activeOrganizationId;
  if(!activeOrgId) return null;

  try {
    const currentTicket = await prisma.supportTicket.findUnique({
      where: {
        id: ticketId,
        organizationId: activeOrgId,
      },
    });

    if (!currentTicket) {
      throw new Error('Ticket not found');
    }
    const { history, assignedTo, assignedToIds, ...updateData } = data;

    const historyEntries = [];
    if (updateData.status && updateData.status !== currentTicket.status) {
      historyEntries.push({
        supportTicketId: ticketId,
        beforeStatus: currentTicket.status,
        afterStatus: updateData.status,
        changedBy: session?.user?.name || 'System',
        createdAt: new Date(),
      });
    }

    if (updateData.priority && updateData.priority !== currentTicket.priority) {
      historyEntries.push({
        supportTicketId: ticketId,
        beforePriority: currentTicket.priority,
        afterPriority: updateData.priority,
        changedBy: session?.user?.name || 'System',
        createdAt: new Date(),
      });
    }

    const relationUpdate = {
      assignedTo: {
        set: assignedToIds.map((id: string) => ({ id })),
      },
    };

    const updatedTicket = await prisma.supportTicket.update({
      where: {
        id: ticketId,
        organizationId: activeOrgId,
      },
      data: {
        ...updateData,
        ...relationUpdate,
      },
      include: {
        assignedTo: true,
        history: true,
      },
    });

    if (historyEntries.length > 0) {
      await prisma.supportTicketHistory.createMany({
        data: historyEntries,
      });
    }

    return updatedTicket;
  } catch (error) {
    console.log('Error in updating ticket: ', error);
    throw error;
  }
}

export async function deleteTicket(ticketId: string) {
  try {
    await prisma.supportTicket.delete({
      where: {
        id: ticketId,
      },
    });
    return true;
  }
  catch (error) {
    console.log('Error in deleting ticket: ', error);
  }
}
