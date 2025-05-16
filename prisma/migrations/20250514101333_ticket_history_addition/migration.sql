-- CreateTable
CREATE TABLE "support_ticket_history" (
    "id" TEXT NOT NULL,
    "supportTicketId" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "support_ticket_history" ADD CONSTRAINT "support_ticket_history_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "support_ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
