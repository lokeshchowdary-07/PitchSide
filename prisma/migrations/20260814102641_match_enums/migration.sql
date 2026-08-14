/*
  Warnings:

  - The `status` column on the `Match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `toss_decision` column on the `Match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `match_format` on the `Match` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchFormat" AS ENUM ('T20', 'ODI', 'TEST', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TossDecision" AS ENUM ('BAT', 'BOWL');

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "match_format",
ADD COLUMN     "match_format" "MatchFormat" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
DROP COLUMN "toss_decision",
ADD COLUMN     "toss_decision" "TossDecision";
