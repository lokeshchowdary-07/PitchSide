import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { requireTeamRole } from "../middleware/teamRole.middleware";

import {
  createTeamSchema,
  updateTeamSchema,
  assignRoleSchema,
  roleRequestSchema,
} from "../validators/team.validator";

import {
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
  listMyTeams,
} from "../controllers/team.controller";

import {
  requestToJoinTeam,
  listPendingRequests,
  approveJoinRequest,
  rejectJoinRequest,
  leaveTeam,
  listTeamMembers,
  removeMember,
  assignMemberRole,
  requestRoleChange,
  listRoleChangeRequests,
  approveRoleChange,
  rejectRoleChange,
} from "../controllers/teammember.controller";

const router = Router();

// --- Team CRUD ---
// Create/read/update/delete the Team entity itself.
// "/me" must be registered before "/:teamId" (same HTTP method, GET) —
// otherwise Express would treat "me" as a teamId and this route would never fire.
router.post("/", authMiddleware, validate(createTeamSchema), createTeam);
router.get("/me", authMiddleware, listMyTeams);
router.get("/:teamId", getTeamById);
router.patch("/:teamId", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), validate(updateTeamSchema), updateTeam);
router.delete("/:teamId", authMiddleware, requireTeamRole(["CAPTAIN"]), deleteTeam);

// --- Membership: join / leave / view members ---
// A player requests to join; captain/VC approves or rejects; anyone can view the active roster.
router.post("/:teamId/members", authMiddleware, requestToJoinTeam);
router.delete("/:teamId/members/me", authMiddleware, leaveTeam);
router.get("/:teamId/members", listTeamMembers);
router.get("/:teamId/requests", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), listPendingRequests);
router.patch("/:teamId/members/:playerId/approve", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), approveJoinRequest);
router.patch("/:teamId/members/:playerId/reject", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), rejectJoinRequest);
router.patch("/:teamId/members/:playerId/remove", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), removeMember);

// --- Roles: direct assignment (captain/VC picks someone's role outright) ---
router.patch("/:teamId/members/:playerId/role", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), validate(assignRoleSchema), assignMemberRole);

// --- Roles: self-requested change, needs captain/VC approval ---
router.post("/:teamId/role-request", authMiddleware, validate(roleRequestSchema), requestRoleChange);
router.get("/:teamId/role-requests", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), listRoleChangeRequests);
router.patch("/:teamId/members/:playerId/role-request/approve", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), approveRoleChange);
router.patch("/:teamId/members/:playerId/role-request/reject", authMiddleware, requireTeamRole(["CAPTAIN", "VICE_CAPTAIN"]), rejectRoleChange);

export default router;