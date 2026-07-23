/*
  Warnings:

  - You are about to drop the column `dominant_hand` on the `Player_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player_profile" DROP COLUMN "dominant_hand",
ALTER COLUMN "batting_style" DROP NOT NULL,
ALTER COLUMN "bowling_style" SET DEFAULT 'NONE';
