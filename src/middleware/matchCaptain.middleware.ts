import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isCaptainOfTeam = async (userId: string, teamId: string) => {
  const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
  if (!player) return false;
  const membership = await prisma.teamMember.findUnique({
    where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
  });
  return !!membership && membership.status === "ACTIVE" && membership.role_team === "CAPTAIN";
};

// used on POST /matches — team ids come from the request body, match doesn't exist yet
export const requireCaptainOfEitherTeamBody = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { team1_id, team2_id } = req.body;

    if ((await isCaptainOfTeam(userId, team1_id)) || (await isCaptainOfTeam(userId, team2_id))) {
      return next();
    }
    return res.status(403).json({ message: "Only a captain of one of the two teams can create this match." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

// used on /matches/:matchId/... — team ids come from the existing match row
export const requireCaptainOfMatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({ where: { match_id: matchId } });
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    if ((await isCaptainOfTeam(userId, match.team1_id)) || (await isCaptainOfTeam(userId, match.team2_id))) {
      (req as any).match = match; // save the lookup, controller reuses it
      return next();
    }
    return res.status(403).json({ message: "Only a captain of one of the two teams can do this." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};