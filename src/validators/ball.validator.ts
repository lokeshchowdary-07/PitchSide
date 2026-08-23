import { z } from "zod";

export const scoreBallSchema = z.object({
  innings_id: z.string().uuid(),
  striker_id: z.string().uuid(),
  non_striker_id: z.string().uuid(),
  bowler_id: z.string().uuid(),
  runs: z.number().int().min(0).max(6),
  extra_type: z.enum(["WIDE", "NOBALL", "BYE", "LEGBYE", "PENALTY"]).optional(),
  is_wicket: z.boolean().default(false),
  dismissal_type: z.enum(["BOWLED", "CAUGHT", "LBW", "RUN_OUT", "STUMPED", "HIT_WICKET", "RETIRED_OUT"]).optional(),
  dismissed_player_id: z.string().uuid().optional(),
  fielder_id: z.string().uuid().optional(),
})
  .refine((d) => !d.is_wicket || !!d.dismissal_type, { message: "dismissal_type required when is_wicket is true", path: ["dismissal_type"] })
  .refine((d) => !d.is_wicket || !!d.dismissed_player_id, { message: "dismissed_player_id required when is_wicket is true", path: ["dismissed_player_id"] })
  .refine((d) => !["CAUGHT", "STUMPED", "RUN_OUT"].includes(d.dismissal_type ?? "") || !!d.fielder_id, { message: "fielder_id required for this dismissal type", path: ["fielder_id"] });