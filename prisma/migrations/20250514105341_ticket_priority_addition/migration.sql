-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('Low', 'Medium', 'High');

-- AlterTable
ALTER TABLE "support_ticket" ADD COLUMN     "priority" "SupportTicketPriority" NOT NULL DEFAULT 'Low';
