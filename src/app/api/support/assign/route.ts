import { auth, prisma } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        const user = session?.user.name;
        const activeOrgId = session?.session.activeOrganizationId;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {ticketId, memberIds} = await req.json();
        if(!ticketId || !Array.isArray(memberIds)) {
            return NextResponse.json({error: 'Invalid payload'}, {status: 400});
        }

        const validMembers = await prisma.member.findMany({
            where: {
                id: { in: memberIds },
                organizationId: activeOrgId || '',
            },
            select: { id: true },
        });

        if (validMembers.length !== memberIds.length) {
            return NextResponse.json({ error: 'Some member IDs are invalid or belong to a different organization' }, { status: 400 });
        }

        const validMemberIds = validMembers.map((m) => ({ id: m.id}));
        console.log(validMemberIds);

        const updatedTicket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
              assignedTo: {
                set: validMemberIds,
              },
            },
            include: {
              assignedTo: {
                include: {
                  user: true,
                },
              },
            },
          });

          return NextResponse.json({
            success: true,
            assignedTo: updatedTicket.assignedTo.map((m) => ({
              id: m.id,
              name: m.user.name,
              email: m.user.email,
            })),
          });
    } catch (error) {
        console.error('[SUPPORT_ASSIGN_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}