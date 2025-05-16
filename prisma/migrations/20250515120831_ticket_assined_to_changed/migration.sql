/*
  Warnings:

  - You are about to drop the column `assignedTo` on the `support_ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "support_ticket" DROP COLUMN "assignedTo";

-- CreateTable
CREATE TABLE "_SupportTicketAssignedTo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SupportTicketAssignedTo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SupportTicketAssignedTo_B_index" ON "_SupportTicketAssignedTo"("B");

-- AddForeignKey
ALTER TABLE "_SupportTicketAssignedTo" ADD CONSTRAINT "_SupportTicketAssignedTo_A_fkey" FOREIGN KEY ("A") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupportTicketAssignedTo" ADD CONSTRAINT "_SupportTicketAssignedTo_B_fkey" FOREIGN KEY ("B") REFERENCES "support_ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
