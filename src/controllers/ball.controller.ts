import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { getIO } from "../socket";

const prisma = new PrismaClient();

export const scoreBall = async (req: Request, res: Response) => {
  try {
    const match = (req as any).match; // attached by requireCaptainOfMatch
    const {
      innings_id, striker_id, non_striker_id, bowler_id,
      runs, extra_type, is_wicket, dismissal_type, dismissed_player_id, fielder_id,
    } = req.body;

    if (match.status !== "LIVE") {
      return res.status(400).json({ message: `Match is ${match.status}, not LIVE.` });
    }

    const innings = await prisma.inningStat.findUnique({ where: { innings_id } });
    if (!innings || innings.match_id !== match.match_id) {
      return res.status(404).json({ message: "Innings not found for this match." });
    }
    if (innings.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "This innings has already ended." });
    }

    // squad validation — striker/non-striker on the batting team, bowler/fielder on the bowling team
    const battingMembers = await prisma.teamMember.findMany({
      where: { team_id: innings.batting_team_id, player_id: { in: [striker_id, non_striker_id] }, status: "ACTIVE" },
    });
    if (battingMembers.length !== 2) {
      return res.status(400).json({ message: "Striker and non-striker must both be active members of the batting team." });
    }

    const bowlingIds = fielder_id ? [bowler_id, fielder_id] : [bowler_id];
    const bowlingMembers = await prisma.teamMember.findMany({
      where: { team_id: innings.bowling_team_id, player_id: { in: bowlingIds }, status: "ACTIVE" },
    });
    if (bowlingMembers.length !== bowlingIds.length) {
      return res.status(400).json({ message: "Bowler/fielder must be active members of the bowling team." });
    }

    if (is_wicket && dismissed_player_id !== striker_id && dismissed_player_id !== non_striker_id) {
      return res.status(400).json({ message: "dismissed_player_id must be the striker or non-striker." });
    }

    // over/ball number — always derived, never trusted from the client
    const legalBallsSoFar = await prisma.ball.count({ where: { innings_id, is_legal_delivery: true } });
    const over_no = Math.floor(legalBallsSoFar / 6);
    const ball_no = (legalBallsSoFar % 6) + 1;

    // extras logic (simplified model — see note below)
    const is_wide = extra_type === "WIDE";
    const is_noball = extra_type === "NOBALL";
    const is_penalty = extra_type === "PENALTY";
    const is_bye = extra_type === "BYE";
    const is_legbye = extra_type === "LEGBYE";
    const is_legal_delivery = !is_wide && !is_noball;
    const countsAsBallFaced = !is_wide;

    const batsmen_runs = (!extra_type || is_noball) ? runs : 0;
    const extra_runs = is_wide || is_noball ? 1 + (is_noball ? 0 : runs) : (is_bye || is_legbye || is_penalty ? runs : 0);

    // free hit propagates from the previous delivery, ordered by actual insert time (over/ball numbers can repeat across wides)
    const previousBall = await prisma.ball.findFirst({ where: { innings_id }, orderBy: { created_at: "desc" } });
    const is_freehit = previousBall?.is_noball ?? false;

    const result = await prisma.$transaction(async (tx) => {
      const ball = await tx.ball.create({
        data: {
          match_id: match.match_id, innings_id, over_no, ball_no,
          striker_id, non_striker_id, bowler_id,
          is_wicket, dismissal_type, fielder_id, dismissed_player_id,
          is_legal_delivery, batsmen_runs, extra_type, extra_runs,
          is_noball, is_wide, is_penalty, is_freehit,
        },
      });

      const inningsUpdateData: any = {
        total_runs: { increment: batsmen_runs + extra_runs },
        total_wickets: { increment: is_wicket ? 1 : 0 },
        total_balls: { increment: is_legal_delivery ? 1 : 0 },
        total_extras: { increment: extra_type ? extra_runs : 0 },
      };
      if (is_wide) inningsUpdateData.wides = { increment: extra_runs };
      if (is_noball) inningsUpdateData.no_balls = { increment: extra_runs };
      if (is_bye) inningsUpdateData.byes = { increment: extra_runs };
      if (is_legbye) inningsUpdateData.leg_byes = { increment: extra_runs };
      if (is_penalty) inningsUpdateData.penalty_runs = { increment: extra_runs };

      const updatedInnings = await tx.inningStat.update({ where: { innings_id }, data: inningsUpdateData });

      await tx.playerMatchStat.upsert({
        where: { match_id_player_id: { match_id: match.match_id, player_id: striker_id } },
        create: {
          match_id: match.match_id, player_id: striker_id, team_id: innings.batting_team_id,
          runs: batsmen_runs, balls_faced: countsAsBallFaced ? 1 : 0,
          fours: batsmen_runs === 4 ? 1 : 0, sixes: batsmen_runs === 6 ? 1 : 0,
        },
        update: {
          runs: { increment: batsmen_runs },
          balls_faced: { increment: countsAsBallFaced ? 1 : 0 },
          fours: { increment: batsmen_runs === 4 ? 1 : 0 },
          sixes: { increment: batsmen_runs === 6 ? 1 : 0 },
        },
      });

      // ensure non-striker has a row too, so they appear on the scorecard even on 0
      await tx.playerMatchStat.upsert({
        where: { match_id_player_id: { match_id: match.match_id, player_id: non_striker_id } },
        create: { match_id: match.match_id, player_id: non_striker_id, team_id: innings.batting_team_id },
        update: {},
      });

      const runsConcededToBowler = (is_bye || is_legbye) ? 0 : batsmen_runs + extra_runs;
      const wicketCreditsBowler = is_wicket && dismissal_type !== "RUN_OUT" && dismissal_type !== "RETIRED_OUT";
      await tx.playerMatchStat.upsert({
        where: { match_id_player_id: { match_id: match.match_id, player_id: bowler_id } },
        create: {
          match_id: match.match_id, player_id: bowler_id, team_id: innings.bowling_team_id,
          balls_bowled: is_legal_delivery ? 1 : 0, runs_conceded: runsConcededToBowler,
          wickets: wicketCreditsBowler ? 1 : 0,
        },
        update: {
          balls_bowled: { increment: is_legal_delivery ? 1 : 0 },
          runs_conceded: { increment: runsConcededToBowler },
          wickets: { increment: wicketCreditsBowler ? 1 : 0 },
        },
      });

      if (is_wicket && fielder_id) {
        const field =
          dismissal_type === "CAUGHT" ? "catches" :
          dismissal_type === "STUMPED" ? "stumpings" :
          dismissal_type === "RUN_OUT" ? "run_outs" : null;

        if (field) {
          await tx.playerMatchStat.upsert({
            where: { match_id_player_id: { match_id: match.match_id, player_id: fielder_id } },
            create: { match_id: match.match_id, player_id: fielder_id, team_id: innings.bowling_team_id, [field]: 1 },
            update: { [field]: { increment: 1 } },
          });
        }
      }

      // auto-close the innings: all out (using actual squad size, not a hardcoded 11) or overs complete
      const squadSize = await tx.teamMember.count({ where: { team_id: innings.batting_team_id, status: "ACTIVE" } });
      const allOut = updatedInnings.total_wickets >= squadSize - 1;
      const oversComplete = updatedInnings.total_balls >= match.overs * 6;

      if (allOut || oversComplete) {
        await tx.inningStat.update({ where: { innings_id }, data: { status: "COMPLETED" } });
      }

      return { ball, innings: updatedInnings, inningsClosed: allOut || oversComplete };
    });
    

    return res.status(201).json({ message: "Ball recorded.", ...result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};