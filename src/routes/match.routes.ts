import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { requireCaptainOfMatch } from "../middleware/matchCaptain.middleware";
import { createNextInnings, listInningsForMatch, getInningsById } from "../controllers/innings.controller";
import { createMatchSchema, startMatchSchema, createPracticeMatchSchema } from "../validators/match.validator";
import {
  createMatch, listMatches, getMatchById, startMatch, endMatch,
  acceptChallenge, rejectChallenge, cancelChallenge, createPracticeMatch,
} from "../controllers/match.controller";
import ballRoutes from "./ball.routes";
import { getScorecard, getLiveState } from "../controllers/scorecard.controller";


const router = Router();

router.get("/:matchId/live", getLiveState);

router.use("/:matchId/balls", ballRoutes);
router.get("/:matchId/scorecard", getScorecard);

router.post("/", authMiddleware, validate(createMatchSchema), createMatch);
router.post("/practice", authMiddleware, validate(createPracticeMatchSchema), createPracticeMatch);
router.get("/", listMatches);
router.get("/:matchId", getMatchById);

router.post("/:matchId/accept", authMiddleware, requireCaptainOfMatch, acceptChallenge);
router.post("/:matchId/reject", authMiddleware, requireCaptainOfMatch, rejectChallenge);
router.post("/:matchId/cancel", authMiddleware, requireCaptainOfMatch, cancelChallenge);

router.post("/:matchId/start", authMiddleware, requireCaptainOfMatch, validate(startMatchSchema), startMatch);
router.post("/:matchId/end", authMiddleware, requireCaptainOfMatch, endMatch);

router.post("/:matchId/innings", authMiddleware, requireCaptainOfMatch, createNextInnings);
router.get("/:matchId/innings", listInningsForMatch);
router.get("/:matchId/innings/:inningsId", getInningsById);

export default router;