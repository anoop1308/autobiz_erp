import { prisma } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        history: true,
        assignedTo: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const currentTicket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create history entry if status or priority changed
    if (body.status !== currentTicket.status || body.priority !== currentTicket.priority) {
      await prisma.supportTicketHistory.create({
        data: {
          supportTicketId: params.id,
          beforeStatus: currentTicket.status,
          afterStatus: body.status,
          beforePriority: currentTicket.priority,
          afterPriority: body.priority,
        },
      });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        customerName: body.customerName,
        product: body.product,
        issueType: body.issueType,
        description: body.description,
        whatsapp: body.whatsapp,
        status: body.status,
        priority: body.priority,
      },
      include: {
        history: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Failed to update ticket:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}