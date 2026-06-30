/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `personalDetails` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "personalDetails",
DROP COLUMN "profilePicture",
DROP COLUMN "updatedAt",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "profile_picture" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Player_profile" (
    "player_id" TEXT NOT NULL,
    "user_id" TEXT,
    "player_name" TEXT NOT NULL,
    "player_role" TEXT NOT NULL,
    "specialization" TEXT,
    "batting_style" TEXT,
    "bowling_style" TEXT,
    "dominant_hand" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Player_profile_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "Team" (
    "team_id" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("team_id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "role_team" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("team_id","player_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_profile_user_id_key" ON "Player_profile"("user_id");

-- AddForeignKey
ALTER TABLE "Player_profile" ADD CONSTRAINT "Player_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player_profile"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;
