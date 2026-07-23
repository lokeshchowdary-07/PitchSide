import { Request, Response, NextFunction } from "express";
import { PrismaClient, TeamRole } from "@prisma/client";

const prisma = new PrismaClient();

export const requireTeamRole = (allowedRoles: TeamRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { teamId } = req.params as { teamId: string };

      const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
      if (!player) {
        return res.status(403).json({ message: "You need a player profile to do this." });
      }

      const membership = await prisma.teamMember.findUnique({
        where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
      });

      if (!membership || membership.status !== "ACTIVE" || !allowedRoles.includes(membership.role_team)) {
        return res.status(403).json({ message: "You don't have permission to do this." });
      }

      (req as any).membership = membership;
      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal server error." });
    }
  };