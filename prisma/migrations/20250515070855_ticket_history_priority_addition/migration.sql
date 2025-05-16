/*
  Warnings:

  - Added the required column `priority` to the `support_ticket_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "support_ticket_history" ADD COLUMN     "priority" "SupportTicketPriority" NOT NULL;
