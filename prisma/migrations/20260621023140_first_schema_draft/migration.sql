/*
  Warnings:

  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Follow";

-- CreateTable
CREATE TABLE "Match" (
    "match_id" TEXT NOT NULL,
    "team1_id" TEXT NOT NULL,
    "team2_id" TEXT NOT NULL,
    "match_format" TEXT NOT NULL,
    "overs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "toss_winner" TEXT,
    "toss_decision" TEXT,
    "winner" TEXT,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "potm_player_id" TEXT,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("match_id")
);

-- CreateTable
CREATE TABLE "Ball" (
    "ball_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "innings_id" TEXT NOT NULL,
    "over_no" INTEGER NOT NULL,
    "ball_no" INTEGER NOT NULL,
    "striker_id" TEXT NOT NULL,
    "non_striker_id" TEXT NOT NULL,
    "bowler_id" TEXT NOT NULL,
    "is_wicket" BOOLEAN NOT NULL DEFAULT false,
    "dismissal_type" TEXT,
    "fielder_id" TEXT,
    "dismissed_player_id" TEXT,
    "is_legal_delivery" BOOLEAN NOT NULL DEFAULT true,
    "batsmen_runs" INTEGER NOT NULL DEFAULT 0,
    "extra_type" TEXT,
    "extra_runs" INTEGER NOT NULL DEFAULT 0,
    "is_noball" BOOLEAN NOT NULL DEFAULT false,
    "is_wide" BOOLEAN NOT NULL DEFAULT false,
    "is_penalty" BOOLEAN NOT NULL DEFAULT false,
    "is_freehit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ball_pkey" PRIMARY KEY ("ball_id")
);

-- CreateTable
CREATE TABLE "PlayerMatchStat" (
    "match_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls_faced" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "balls_bowled" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "runs_conceded" INTEGER NOT NULL DEFAULT 0,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "stumpings" INTEGER NOT NULL DEFAULT 0,
    "run_outs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerMatchStat_pkey" PRIMARY KEY ("match_id","player_id")
);

-- CreateTable
CREATE TABLE "PlayerStat" (
    "player_id" TEXT NOT NULL,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "innings" INTEGER NOT NULL DEFAULT 0,
    "runs" INTEGER NOT NULL DEFAULT 0,
    "balls_faced" INTEGER NOT NULL DEFAULT 0,
    "fours" INTEGER NOT NULL DEFAULT 0,
    "sixes" INTEGER NOT NULL DEFAULT 0,
    "highest_score" INTEGER NOT NULL DEFAULT 0,
    "wickets" INTEGER NOT NULL DEFAULT 0,
    "balls_bowled" INTEGER NOT NULL DEFAULT 0,
    "runs_conceded" INTEGER NOT NULL DEFAULT 0,
    "maidens" INTEGER NOT NULL DEFAULT 0,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "stumpings" INTEGER NOT NULL DEFAULT 0,
    "run_outs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerStat_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "InningStat" (
    "innings_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "batting_team_id" TEXT NOT NULL,
    "bowling_team_id" TEXT NOT NULL,
    "total_runs" INTEGER NOT NULL DEFAULT 0,
    "total_wickets" INTEGER NOT NULL DEFAULT 0,
    "total_balls" INTEGER NOT NULL DEFAULT 0,
    "total_extras" INTEGER NOT NULL DEFAULT 0,
    "byes" INTEGER NOT NULL DEFAULT 0,
    "leg_byes" INTEGER NOT NULL DEFAULT 0,
    "wides" INTEGER NOT NULL DEFAULT 0,
    "no_balls" INTEGER NOT NULL DEFAULT 0,
    "penalty_runs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InningStat_pkey" PRIMARY KEY ("innings_id")
);

-- CreateTable
CREATE TABLE "TeamStat" (
    "team_id" TEXT NOT NULL,
    "matches" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "no_results" INTEGER NOT NULL DEFAULT 0,
    "runs_scored" INTEGER NOT NULL DEFAULT 0,
    "balls_faced" INTEGER NOT NULL DEFAULT 0,
    "wickets_lost" INTEGER NOT NULL DEFAULT 0,
    "runs_conceded" INTEGER NOT NULL DEFAULT 0,
    "balls_bowled" INTEGER NOT NULL DEFAULT 0,
    "wickets_taken" INTEGER NOT NULL DEFAULT 0,
    "catches" INTEGER NOT NULL DEFAULT 0,
    "stumpings" INTEGER NOT NULL DEFAULT 0,
    "run_outs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeamStat_pkey" PRIMARY KEY ("team_id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_potm_player_id_fkey" FOREIGN KEY ("potm_player_id") REFERENCES "Player_profile"("player_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_toss_winner_fkey" FOREIGN KEY ("toss_winner") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winner_fkey" FOREIGN KEY ("winner") REFERENCES "Team"("team_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_striker_id_fkey" FOREIGN KEY ("striker_id") REFERENCES "Player_profile"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_non_striker_id_fkey" FOREIGN KEY ("non_striker_id") REFERENCES "Player_profile"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_bowler_id_fkey" FOREIGN KEY ("bowler_id") REFERENCES "Player_profile"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_fielder_id_fkey" FOREIGN KEY ("fielder_id") REFERENCES "Player_profile"("player_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_dismissed_player_id_fkey" FOREIGN KEY ("dismissed_player_id") REFERENCES "Player_profile"("player_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ball" ADD CONSTRAINT "Ball_innings_id_fkey" FOREIGN KEY ("innings_id") REFERENCES "InningStat"("innings_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player_profile"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStat" ADD CONSTRAINT "PlayerStat_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player_profile"("player_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InningStat" ADD CONSTRAINT "InningStat_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("match_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InningStat" ADD CONSTRAINT "InningStat_batting_team_id_fkey" FOREIGN KEY ("batting_team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InningStat" ADD CONSTRAINT "InningStat_bowling_team_id_fkey" FOREIGN KEY ("bowling_team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStat" ADD CONSTRAINT "TeamStat_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("team_id") ON DELETE RESTRICT ON UPDATE CASCADE;
