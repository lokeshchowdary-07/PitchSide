import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!player) {
      return res.status(400).json({ message: "Create a player profile before creating a team." });
    }

    const team = await prisma.team.create({
      data: {
        team_name: req.body.team_name,
        logo: req.body.logo,
        description: req.body.description,
        team_members: {
          create: {
            player_id: player.player_id,
            role_team: "CAPTAIN",
            status: "ACTIVE",
            joined_at: new Date(),
          },
        },
      },
      include: { team_members: true },
    });

    return res.status(201).json({ message: "Team created.", team });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
      const { teamId } = req.params as { teamId: string };    
      const team = await prisma.team.findUnique({
      where: { team_id: teamId },
      include: { team_members: true },
    });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }
    return res.status(200).json({ team });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};  

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;

    const team = await prisma.team.findUnique({ where: { team_id: teamId } });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const updated = await prisma.team.update({
      where: { team_id: teamId },
      data: req.body,
    });

    return res.status(200).json({ message: "Team updated.", team: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;

    const team = await prisma.team.findUnique({ where: { team_id: teamId } });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    await prisma.team.delete({ where: { team_id: teamId } });

    return res.status(200).json({ message: "Team deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listMyTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!player) {
      return res.status(404).json({ message: "Player profile not found." });
    }

    const memberships = await prisma.teamMember.findMany({
      where: { player_id: player.player_id, status: "ACTIVE" },
      include: { team: true },
    });

    return res.status(200).json({ teams: memberships.map((m) => m.team) });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};