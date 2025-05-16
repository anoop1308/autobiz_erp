import { auth, prisma } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { SupportTicketStatus } from "@/prisma/generated";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const org = await auth.api.getFullOrganization({
        headers: {
            cookie: req.headers.get("cookie") || "",
        }
    });

    try {
        const session = await authClient.getSession();
        const session2 = await auth.api.getSession({
            headers: await headers()
        });
        const user = session2?.user.name;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        if (!org?.id) {
            return NextResponse.json({ error: 'No active organization selected' }, { status: 400 });
        }
        
        const data = await req.json();
        const { customerName, product, issueType, description, whatsapp, priority } = data;
        
        // Validate required fields
        if (!customerName || !product || !issueType || !description || !whatsapp || !priority) {
            return new Response(JSON.stringify({
                error: 'Missing required fields',
                details: {
                    customerName: !customerName,
                    product: !product,
                    issueType: !issueType,
                    description: !description,
                    whatsapp: !whatsapp,
                    priority: !priority,
                }
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create support ticket
        const ticket = await prisma.supportTicket.create({
            data: {
                customerName,
                product,
                issueType,
                description,
                whatsapp,
                priority,
                organizationId: org.id,
                status: SupportTicketStatus.New,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        });

        await prisma.supportTicketHistory.create({
            data: {
                supportTicketId: ticket.id,
                beforeStatus: SupportTicketStatus.New,
                beforePriority: priority,
                changedBy: user,
                createdAt: new Date()
            }
        });

        return new Response(JSON.stringify({
            message: 'Support ticket created successfully',
            ticket
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        return new Response(JSON.stringify({ error: 'Failed to create support ticket' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}