import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { requireCaptainOfMatch } from "../middleware/matchCaptain.middleware";
import { scoreBallSchema } from "../validators/ball.validator";
import { scoreBall } from "../controllers/ball.controller";

const router = Router({ mergeParams: true });

router.post("/", authMiddleware, requireCaptainOfMatch, validate(scoreBallSchema), scoreBall);

export default router;