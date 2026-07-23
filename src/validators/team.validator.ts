import { z } from "zod";

export const createTeamSchema = z.object({
  team_name: z.string().min(1),
  logo: z.string().url().optional(),
  description: z.string().max(300).optional(),
});

export const assignRoleSchema = z.object({
  role_team: z.enum(["CAPTAIN", "VICE_CAPTAIN", "MEMBER"]),
});

export const updateTeamSchema = createTeamSchema.partial();

export const roleRequestSchema = z.object({
  requested_role: z.enum(["CAPTAIN", "VICE_CAPTAIN", "MEMBER"]),
});