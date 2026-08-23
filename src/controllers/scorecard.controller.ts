import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getScorecard = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({
      where: { match_id: matchId },
      include: { team1: true, team2: true },
    });
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    const innings = await prisma.inningStat.findMany({
      where: { match_id: matchId },
      orderBy: { innings_number: "asc" },
      include: { batting_team: true, bowling_team: true },
    });

    const scorecard = await Promise.all(
      innings.map(async (inn) => {
        const stats = await prisma.playerMatchStat.findMany({
          where: { match_id: matchId, team_id: { in: [inn.batting_team_id, inn.bowling_team_id] } },
          include: { player: true },
        });

        const battingCard = stats
          .filter((s) => s.team_id === inn.batting_team_id && (s.balls_faced > 0 || s.runs > 0))
          .map((s) => ({
            player_id: s.player_id,
            player_name: s.player.player_name,
            runs: s.runs,
            balls_faced: s.balls_faced,
            fours: s.fours,
            sixes: s.sixes,
            strike_rate: s.balls_faced > 0 ? +((s.runs / s.balls_faced) * 100).toFixed(2) : 0,
          }));

        const bowlingCard = stats
          .filter((s) => s.team_id === inn.bowling_team_id && s.balls_bowled > 0)
          .map((s) => ({
            player_id: s.player_id,
            player_name: s.player.player_name,
            overs: `${Math.floor(s.balls_bowled / 6)}.${s.balls_bowled % 6}`,
            runs_conceded: s.runs_conceded,
            wickets: s.wickets,
            economy: s.balls_bowled > 0 ? +((s.runs_conceded / (s.balls_bowled / 6)).toFixed(2)) : 0,
          }));

        return {
          innings_id: inn.innings_id,
          innings_number: inn.innings_number,
          status: inn.status,
          batting_team: inn.batting_team.team_name,
          bowling_team: inn.bowling_team.team_name,
          total_runs: inn.total_runs,
          total_wickets: inn.total_wickets,
          overs: `${Math.floor(inn.total_balls / 6)}.${inn.total_balls % 6}`,
          extras: { total: inn.total_extras, byes: inn.byes, leg_byes: inn.leg_byes, wides: inn.wides, no_balls: inn.no_balls, penalty: inn.penalty_runs },
          batting: battingCard,
          bowling: bowlingCard,
        };
      })
    );

    return res.status(200).json({
      match_id: match.match_id,
      status: match.status,
      team1: match.team1.team_name,
      team2: match.team2.team_name,
      //result_type: match.result_type,
      //result_margin: match.result_margin,
      winner: match.winner,
      innings: scorecard,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getLiveState = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.matchId as string;

    const match = await prisma.match.findUnique({ where: { match_id: matchId } });
    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    const innings = await prisma.inningStat.findFirst({
      where: { match_id: matchId, status: "IN_PROGRESS" },
      orderBy: { innings_number: "desc" },
    });

    if (!innings) {
      return res.status(200).json({ match_status: match.status, message: "No innings currently in progress." });
    }

    const lastBall = await prisma.ball.findFirst({
      where: { innings_id: innings.innings_id },
      orderBy: { created_at: "desc" },
    });

    if (!lastBall) {
      return res.status(200).json({
        match_status: match.status, innings_id: innings.innings_id,
        total_runs: innings.total_runs, total_wickets: innings.total_wickets, overs: "0.0",
        message: "Innings hasn't started yet.",
      });
    }

    const relevantIds = [lastBall.striker_id, lastBall.non_striker_id, lastBall.bowler_id];
    const stats = await prisma.playerMatchStat.findMany({
      where: { match_id: matchId, player_id: { in: relevantIds } },
      include: { player: true },
    });

    const find = (id: string) => {
      const s = stats.find((x) => x.player_id === id);
      return s ? { player_id: s.player_id, name: s.player.player_name, runs: s.runs, balls_faced: s.balls_faced, fours: s.fours, sixes: s.sixes, wickets: s.wickets, runs_conceded: s.runs_conceded, balls_bowled: s.balls_bowled } : null;
    };

    return res.status(200).json({
      match_status: match.status,
      innings_id: innings.innings_id,
      total_runs: innings.total_runs,
      total_wickets: innings.total_wickets,
      overs: `${Math.floor(innings.total_balls / 6)}.${innings.total_balls % 6}`,
      extras: innings.total_extras,
      striker: find(lastBall.striker_id),
      non_striker: find(lastBall.non_striker_id),
      bowler: find(lastBall.bowler_id),
      last_ball: { over_no: lastBall.over_no, ball_no: lastBall.ball_no, runs: lastBall.batsmen_runs, extra_type: lastBall.extra_type, is_wicket: lastBall.is_wicket },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};