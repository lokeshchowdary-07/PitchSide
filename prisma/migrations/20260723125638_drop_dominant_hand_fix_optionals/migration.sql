/*
  Warnings:

  - You are about to drop the column `is_active` on the `TeamMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "is_active",
ALTER COLUMN "joined_at" DROP DEFAULT;
