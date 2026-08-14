import { z } from "zod";

export const createMatchSchema = z.object({
  team1_id: z.string().uuid(),
  team2_id: z.string().uuid(),
  match_format: z.enum(["T20", "ODI", "TEST", "CUSTOM"]),
  overs: z.number().int().positive(),
  scheduled_time: z.coerce.date(),
});

export const startMatchSchema = z.object({
  toss_winner: z.string().uuid(),
  toss_decision: z.enum(["BAT", "BOWL"]),
});

const practicePlayerSchema = z.union([
  z.object({ player_id: z.string().uuid() }),                                  // real, registered
  z.object({ player_name: z.string().min(1), player_role: z.enum(["BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKET_KEEPER"]) }), // guest
]);

export const createPracticeMatchSchema = z.object({
  match_format: z.enum(["T20", "ODI", "TEST", "CUSTOM"]),
  overs: z.number().int().positive(),
  scheduled_time: z.coerce.date().optional(),
  team1: z.object({ team_name: z.string().min(1), players: z.array(practicePlayerSchema).min(1) }),
  team2: z.object({ team_name: z.string().min(1), players: z.array(practicePlayerSchema).min(1) }),
});