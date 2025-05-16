/*
  Warnings:

  - The values [Low,Medium,High] on the enum `SupportTicketPriority` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SupportTicketPriority_new" AS ENUM ('low', 'medium', 'high');
ALTER TABLE "support_ticket" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "support_ticket" ALTER COLUMN "priority" TYPE "SupportTicketPriority_new" USING ("priority"::text::"SupportTicketPriority_new");
ALTER TYPE "SupportTicketPriority" RENAME TO "SupportTicketPriority_old";
ALTER TYPE "SupportTicketPriority_new" RENAME TO "SupportTicketPriority";
DROP TYPE "SupportTicketPriority_old";
ALTER TABLE "support_ticket" ALTER COLUMN "priority" SET DEFAULT 'low';
COMMIT;

-- AlterTable
ALTER TABLE "support_ticket" ALTER COLUMN "priority" SET DEFAULT 'low';
