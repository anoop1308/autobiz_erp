import { prisma } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId');
  if (!ticketId) {
    return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
  }
  try {
    const history = await prisma.supportTicketHistory.findMany({
      where: { supportTicketId: ticketId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        beforeStatus: true,
        afterStatus: true,
        beforePriority: true,
        afterPriority: true,
        changedBy: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: error ?? 'Failed to fetch history' }, { status: 500 });
  }
} 