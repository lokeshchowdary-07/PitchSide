/*
  Warnings:

  - The `role_team` column on the `TeamMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `player_role` on the `Player_profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `batting_style` to the `Player_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bowling_style` to the `Player_profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dominant_hand` to the `Player_profile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BattingStyle" AS ENUM ('RIGHT_HANDED', 'LEFT_HANDED');

-- CreateEnum
CREATE TYPE "BowlingStyle" AS ENUM ('RIGHT_ARM_FAST', 'RIGHT_ARM_MEDIUM', 'RIGHT_ARM_OFFBREAK', 'RIGHT_ARM_LEGBREAK', 'LEFT_ARM_FAST', 'LEFT_ARM_MEDIUM', 'LEFT_ARM_ORTHODOX', 'LEFT_ARM_CHINAMAN', 'NONE');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'WICKET_KEEPER');

-- CreateEnum
CREATE TYPE "DominantHand" AS ENUM ('LEFT_HANDED', 'RIGHT_HANDED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('CAPTAIN', 'VICE_CAPTAIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'LEFT', 'REMOVED');

-- AlterTable
ALTER TABLE "Player_profile" DROP COLUMN "player_role",
ADD COLUMN     "player_role" "PlayerRole" NOT NULL,
DROP COLUMN "batting_style",
ADD COLUMN     "batting_style" "BattingStyle" NOT NULL,
DROP COLUMN "bowling_style",
ADD COLUMN     "bowling_style" "BowlingStyle" NOT NULL,
DROP COLUMN "dominant_hand",
ADD COLUMN     "dominant_hand" "DominantHand" NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "role_team",
ADD COLUMN     "role_team" "TeamRole" NOT NULL DEFAULT 'MEMBER',
ALTER COLUMN "joined_at" DROP NOT NULL;
