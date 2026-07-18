import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createPlayerProfileSchema, updatePlayerProfileSchema } from "../validators/player.validator";
import {
  createPlayerProfile,
  getOwnPlayerProfile,
  getPlayerById,
  updateOwnPlayerProfile,
} from "../controllers/player.controller";

const router = Router();

router.post("/profile", authMiddleware, validate(createPlayerProfileSchema), createPlayerProfile);
router.get("/profile", authMiddleware, getOwnPlayerProfile);
router.get("/:id", getPlayerById);
router.patch("/profile", authMiddleware, validate(updatePlayerProfileSchema), updateOwnPlayerProfile);

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;