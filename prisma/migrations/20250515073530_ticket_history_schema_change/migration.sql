/*
  Warnings:

  - You are about to drop the column `priority` on the `support_ticket_history` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `support_ticket_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "support_ticket_history" DROP COLUMN "priority",
DROP COLUMN "status",
ADD COLUMN     "afterPriority" "SupportTicketPriority",
ADD COLUMN     "afterStatus" "SupportTicketStatus",
ADD COLUMN     "beforePriority" "SupportTicketPriority",
ADD COLUMN     "beforeStatus" "SupportTicketStatus",
ADD COLUMN     "changedBy" TEXT;
