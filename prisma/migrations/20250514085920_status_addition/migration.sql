/*
  Warnings:

  - The `status` column on the `support_ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('New', 'Acknowledged', 'Investigation', 'Awaiting_Customer_Response', 'In_Progress', 'Resolved', 'Closed');

-- AlterTable
ALTER TABLE "support_ticket" DROP COLUMN "status",
ADD COLUMN     "status" "SupportTicketStatus" NOT NULL DEFAULT 'New';
