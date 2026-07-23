-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_team_id_fkey";

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requested_role" "TeamRole",
ADD COLUMN     "role_requested_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;
