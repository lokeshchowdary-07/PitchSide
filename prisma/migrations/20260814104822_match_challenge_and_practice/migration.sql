/*
  Warnings:

  - Added the required column `innings_number` to the `InningStat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('FORMAL', 'PRACTICE');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('WON_BY_RUNS', 'WON_BY_WICKETS', 'TIE', 'NO_RESULT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchStatus" ADD VALUE 'PENDING';
ALTER TYPE "MatchStatus" ADD VALUE 'REJECTED';
ALTER TYPE "MatchStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "InningStat" ADD COLUMN     "innings_number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "match_type" "MatchType" NOT NULL DEFAULT 'FORMAL',
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "is_temporary" BOOLEAN NOT NULL DEFAULT false;
