import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isCaptainOfTeam = async (userId: string, teamId: string) => {
  const player = await prisma.player_profile.findUnique({ where: { user_id: userId } });
  if (!player) return null;
  const membership = await prisma.teamMember.findUnique({
    where: { team_id_player_id: { team_id: teamId, player_id: player.player_id } },
  });
  return membership && membership.status === "ACTIVE" && membership.role_team === "CAPTAIN" ? player : null;
};

export const createMatch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { team1_id, team2_id, match_format, overs, scheduled_time } = req.body;

    if (team1_id === team2_id) {
      return res.status(400).json({ message: "A team cannot play itself." });
    }

    const [team1, team2] = await Promise.all([
      prisma.team.findUnique({ where: { team_id: team1_id } }),
      prisma.team.findUnique({ where: { team_id: team2_id } }),
    ]);
    if (!team1 || !team2) {
      return res.status(404).json({ message: "One or both teams not found." });
    }

    // figure out which team the requester actually represents — that's the challenger
    const challengerTeamId = (await isCaptainOfTeam(userId, team1_id))
      ? team1_id
      : (await isCaptainOfTeam(userId, team2_id))
      ? team2_id
      : null;

    if (!challengerTeamId) {
      return res.status(403).json({ message: "Only a captain of one of the two teams can issue this challenge." });
    }

    const match = await prisma.match.create({
      data: {
        team1_id, team2_id, match_format, overs, scheduled_time,
        match_type: "FORMAL",
        status: "PENDING",
        challenger_team_id: challengerTeamId,
      },
    });

    return res.status(201).json({ message: "Challenge sent.", match });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const respondToChallenge = (newStatus: "SCHEDULED" | "REJECTED") =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const match = (req as any).match;

      if (match.status !== "PENDING") {
        return res.status(400).json({ message: `Cannot respond, challenge is already ${match.status}.` });
      }

      const opponentTeamId = match.challenger_team_id === match.team1_id ? match.team2_id : match.team1_id;
      const responder = await isCaptainOfTeam(userId, opponentTeamId);
      if (!responder) {
        return res.status(403).json({ message: "Only the challenged team's captain can respond." });
      }

      const updated = await prisma.match.update({ where: { match_id: match.match_id }, data: { status: newStatus } });
      return res.status(200).json({ message: newStatus === "SCHEDULED" ? "Challenge accepted." : "Challenge rejected.", match: updated });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error." });
    }
  };

export const acceptChallenge = respondToChallenge("SCHEDULED");
export const rejectChallenge = respondToChallenge("REJECTED");

export const cancelChallenge = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const match = (req as any).match;

    if (match.status !== "PENDING") {
      return res.status(400).json({ message: `Cannot cancel, challenge is already ${match.status}.` });
    }

    const challenger = await isCaptainOfTeam(userId, match.challenger_team_id);
    if (!challenger) {
      return res.status(403).json({ message: "Only the challenging team's captain can cancel." });
    }

    const updated = await prisma.match.update({ where: { match_id: match.match_id }, data: { status: "CANCELLED" } });
    return res.status(200).json({ message: "Challenge cancelled.", match: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

const buildTempTeam = async (
  tx: any,
  teamInput: { team_name: string; players: Array<{ player_id?: string; player_name?: string; player_role?: string }> },
  captainIndex = 0
) => {
  const team = await tx.team.create({ data: { team_name: teamInput.team_name, is_temporary: true } });

  for (let i = 0; i < teamInput.players.length; i++) {
    const p = teamInput.players[i];

    let playerId: string;
    if (p.player_id) {
      const existing = await tx.player_profile.findUnique({ where: { player_id: p.player_id } });
      if (!existing) throw new Error(`Player ${p.player_id} not found.`);
      playerId = existing.player_id;
    } else {
      const guest = await tx.player_profile.create({
        data: { player_name: p.player_name!, player_role: p.player_role!, bowling_style: "NONE" },
      });
      playerId = guest.player_id;
    }

    await tx.teamMember.create({
      data: {
        team_id: team.team_id,
        player_id: playerId,
        role_team: i === captainIndex ? "CAPTAIN" : "MEMBER",
        status: "ACTIVE",
        joined_at: new Date(),
      },
    });
  }

  return team;
};

export const createPracticeMatch = async (req: Request, res: Response) => {
  try {
    const { match_format, overs, scheduled_time, team1, team2 } = req.body;

    const match = await prisma.$transaction(async (tx) => {
      const t1 = await buildTempTeam(tx, team1);
      const t2 = await buildTempTeam(tx, team2);

      return tx.match.create({
        data: {
          team1_id: t1.team_id,
          team2_id: t2.team_id,
          match_format, overs,
          scheduled_time: scheduled_time ?? new Date(),
          match_type: "PRACTICE",
          status: "SCHEDULED", // no challenge/accept step for practice
        },
      });
    });

    return res.status(201).json({ message: "Practice match created.", match });
  } catch (error: any) {
    return res.status(400).json({ message: error.message ?? "Failed to create practice match." });
  }
};

export const startMatch = async (req: Request, res: Response) => {
  try {
    const match = (req as any).match;
    const { toss_winner, toss_decision } = req.body;

    if (match.status !== "SCHEDULED") {
      return res.status(400).json({ message: `Cannot start a match that is ${match.status}.` });
    }
    if (toss_winner !== match.team1_id && toss_winner !== match.team2_id) {
      return res.status(400).json({ message: "toss_winner must be one of the two teams in this match." });
    }

    const updated = await prisma.match.update({
      where: { match_id: match.match_id },
      data: { status: "LIVE", start_time: new Date(), toss_winner, toss_decision },
    });
    return res.status(200).json({ message: "Match started.", match: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const endMatch = async (req: Request, res: Response) => {
  try {
    const match = (req as any).match;
    const { potm_player_id } = req.body;

    if (match.status !== "LIVE") {
      return res.status(400).json({ message: `Cannot end a match that is ${match.status}.` });
    }

    const innings = await prisma.inningStat.findMany({
      where: { match_id: match.match_id },
      orderBy: { innings_number: "asc" },
    });

    let winner: string | null = null;
    let result_type: "WON_BY_RUNS" | "WON_BY_WICKETS" | "TIE" | "NO_RESULT";
    let result_margin: number | null = null;

    if (innings.length < 2) {
      result_type = "NO_RESULT";
    } else {
      const [first, second] = innings; // first = batted first, second = chased
      if (first.total_runs > second.total_runs) {
        winner = first.batting_team_id;
        result_type = "WON_BY_RUNS";
        result_margin = first.total_runs - second.total_runs;
      } else if (second.total_runs > first.total_runs) {
        winner = second.batting_team_id;
        result_type = "WON_BY_WICKETS";
        result_margin = Math.max(0, 10 - second.total_wickets); // assumes 10-wicket-per-side; revisit for smaller squads
      } else {
        result_type = "TIE";
      }
    }

    const updated = await prisma.match.update({
      where: { match_id: match.match_id },
      data: { status: "COMPLETED", end_time: new Date(), winner, result_type, result_margin, potm_player_id: potm_player_id ?? null },
    });

    return res.status(200).json({ message: "Match ended.", match: updated });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listMatches = async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { scheduled_time: "desc" },
      include: { team1: true, team2: true },
    });
    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.matchId as string;
    const match = await prisma.match.findUnique({
      where: { match_id: matchId },
      include: { team1: true, team2: true, innings: true },
    });
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }
    return res.status(200).json({ match });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};