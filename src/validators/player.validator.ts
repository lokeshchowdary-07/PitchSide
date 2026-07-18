import { z } from "zod";

export const createPlayerProfileSchema = z.object({
  player_name: z.string().min(1).optional(), // falls back to user's name if omitted
  player_role: z.enum(["BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKET_KEEPER"]),
  specialization: z.string().max(100).optional(),
  batting_style: z.enum(["RIGHT_HANDED", "LEFT_HANDED"]).optional(),
  bowling_style: z.enum([
    "RIGHT_ARM_FAST", "RIGHT_ARM_MEDIUM", "RIGHT_ARM_OFFBREAK", "RIGHT_ARM_LEGBREAK",
    "LEFT_ARM_FAST", "LEFT_ARM_MEDIUM", "LEFT_ARM_ORTHODOX", "LEFT_ARM_CHINAMAN", "NONE",
  ]).optional(),
});

export const updatePlayerProfileSchema = createPlayerProfileSchema.partial();