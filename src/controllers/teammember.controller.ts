import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const requestToJoinTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const teamId = req.params.teamId as string;

    const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!player) {
      return res.status(400).json({ message: "Create a player profile before joining a team." });
    }

    const team = await prisma.team.findUnique({ where: { team_id: teamId } });
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    const existing = await prisma.teamMember.findUnique({
      where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return res.status(409).json({ message: "Already a member of this team." });
      }
      if (existing.status === "PENDING") {
        return res.status(409).json({ message: "Join request already pending." });
      }
      const updated = await prisma.teamMember.update({
        where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
        data: { status: "PENDING", role_team: "MEMBER", requested_at: new Date(), joined_at: null, left_at: null },
      });
      return res.status(200).json({ message: "Join request sent.", membership: updated });
    }

    const membership = await prisma.teamMember.create({
      data: { team_id: teamId, player_id: player.player_id, role_team: "MEMBER", status: "PENDING" },
    });

    return res.status(201).json({ message: "Join request sent.", membership });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listPendingRequests = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;
    const requests = await prisma.teamMember.findMany({
      where: { team_id: teamId, status: "PENDING" },
      include: { player_profile: true },
    });
    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const respondToJoinRequest = (decision: "ACTIVE" | "REJECTED") =>
  async (req: Request, res: Response) => {
    try {
      const teamId = req.params.teamId as string;
      const playerId = req.params.playerId as string;

      const membership = await prisma.teamMember.findUnique({
        where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
      });

      if (!membership || membership.status !== "PENDING") {
        return res.status(404).json({ message: "No pending request found." });
      }

      const updated = await prisma.teamMember.update({
        where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
        data: { status: decision, joined_at: decision === "ACTIVE" ? new Date() : null },
      });

      return res.status(200).json({
        message: decision === "ACTIVE" ? "Request approved." : "Request rejected.",
        membership: updated,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error." });
    }
  };

export const approveJoinRequest = respondToJoinRequest("ACTIVE");
export const rejectJoinRequest = respondToJoinRequest("REJECTED");

export const leaveTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const teamId = req.params.teamId as string;

    const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!player) {
      return res.status(404).json({ message: "Player profile not found." });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return res.status(404).json({ message: "You are not an active member of this team." });
    }

    if (membership.role_team === "CAPTAIN") {
      return res.status(400).json({ message: "Transfer captaincy before leaving." });
    }

    const updated = await prisma.teamMember.update({
      where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
      data: { status: "LEFT", left_at: new Date() },
    });

    return res.status(200).json({ message: "Left the team.", membership: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const assignMemberRole = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;
    const playerId = req.params.playerId as string;
    const { role_team } = req.body;

    const membership = await prisma.teamMember.findUnique({
      where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return res.status(404).json({ message: "Active membership not found." });
    }

    const updated = await prisma.teamMember.update({
      where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
      data: { role_team },
    });

    return res.status(200).json({ message: "Role updated.", membership: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;

    const members = await prisma.teamMember.findMany({
      where: { team_id: teamId, status: "ACTIVE" },
      include: { player_profile: true },
    });

    return res.status(200).json({ members });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const removeMember = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;
    const playerId = req.params.playerId as string;

    const membership = await prisma.teamMember.findUnique({
      where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return res.status(404).json({ message: "Active membership not found." });
    }

    const updated = await prisma.teamMember.update({
      where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
      data: { status: "REMOVED", left_at: new Date() },
    });

    return res.status(200).json({ message: "Member removed.", membership: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const requestRoleChange = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const teamId = req.params.teamId as string;
    const { requested_role } = req.body;

    const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
    if (!player) {
      return res.status(404).json({ message: "Player profile not found." });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return res.status(404).json({ message: "You are not an active member of this team." });
    }

    if (membership.role_team === requested_role) {
      return res.status(409).json({ message: "You already have this role." });
    }

    const updated = await prisma.teamMember.update({
      where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
      data: { requested_role, role_requested_at: new Date() },
    });

    return res.status(200).json({ message: "Role change requested.", membership: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listRoleChangeRequests = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.teamId as string;

    const requests = await prisma.teamMember.findMany({
      where: { team_id: teamId, status: "ACTIVE", requested_role: { not: null } },
      include: { player_profile: true },
    });

    return res.status(200).json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const respondToRoleChange = (approve: boolean) =>
  async (req: Request, res: Response) => {
    try {
      const teamId = req.params.teamId as string;
      const playerId = req.params.playerId as string;

      const membership = await prisma.teamMember.findUnique({
        where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
      });

      if (!membership || !membership.requested_role) {
        return res.status(404).json({ message: "No pending role request found." });
      }

      const updated = await prisma.teamMember.update({
        where: { team_id_player_id: { team_id: teamId, player_id: playerId } },
        data: {
          role_team: approve ? membership.requested_role : membership.role_team,
          requested_role: null,
          role_requested_at: null,
        },
      });

      return res.status(200).json({
        message: approve ? "Role change approved." : "Role change rejected.",
        membership: updated,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error." });
    }
  };

export const approveRoleChange = respondToRoleChange(true);
export const rejectRoleChange = respondToRoleChange(false);