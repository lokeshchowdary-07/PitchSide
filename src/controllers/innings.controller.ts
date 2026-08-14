import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createNextInnings = async (req: Request, res: Response) => {
  try {
    const match = (req as any).match; // set by requireCaptainOfMatch

    if (match.status !== "LIVE") {
      return res.status(400).json({ message: `Match must be LIVE to start an innings (currently ${match.status}).` });
    }
    if (!match.toss_winner || !match.toss_decision) {
      return res.status(400).json({ message: "Match has no recorded toss result." });
    }

    const existingInnings = await prisma.inningStat.findMany({
      where: { match_id: match.match_id },
      orderBy: { innings_number: "asc" },
    });

    if (existingInnings.length >= 2) {
      return res.status(400).json({ message: "This match already has 2 innings (multi-innings formats like TEST aren't supported yet)." });
    }

    let battingTeamId: string;
    let bowlingTeamId: string;
    const innings_number = existingInnings.length + 1;

    if (innings_number === 1) {
      const otherTeamId = match.toss_winner === match.team1_id ? match.team2_id : match.team1_id;
      if (match.toss_decision === "BAT") {
        battingTeamId = match.toss_winner;
        bowlingTeamId = otherTeamId;
      } else {
        bowlingTeamId = match.toss_winner;
        battingTeamId = otherTeamId;
      }
    } else {
      // innings 2 is just the swap of innings 1
      const firstInnings = existingInnings[0];
      battingTeamId = firstInnings.bowling_team_id;
      bowlingTeamId = firstInnings.batting_team_id;
    }

    const innings = await prisma.inningStat.create({
      data: {
        match_id: match.match_id,
        innings_number,
        batting_team_id: battingTeamId,
        bowling_team_id: bowlingTeamId,
      },
    });

    return res.status(201).json({ message: `Innings ${innings_number} started.`, innings });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const listInningsForMatch = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.matchId as string;
    const innings = await prisma.inningStat.findMany({
      where: { match_id: matchId },
      orderBy: { innings_number: "asc" },
      include: { batting_team: true, bowling_team: true },
    });
    return res.status(200).json({ innings });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getInningsById = async (req: Request, res: Response) => {
  try {
    const inningsId = req.params.inningsId as string;
    const innings = await prisma.inningStat.findUnique({
      where: { innings_id: inningsId },
      include: { batting_team: true, bowling_team: true, balls: true },
    });
    if (!innings) {
      return res.status(404).json({ message: "Innings not found." });
    }
    return res.status(200).json({ innings });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};