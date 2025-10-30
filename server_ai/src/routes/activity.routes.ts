import { Router } from "express";
import {
  postActivity,
  getDreamReactions,
  getPopularController,
} from "../controllers/dreamActivity.controller";
import authenticate from "../middlewares/authenticate";
const router = Router();

// פופולרי
router.get("/popular", getPopularController);

// ריאקציות
router.get("/:id/reactions", getDreamReactions);

// פעילות (view/like/dislike)
router.post("/:id", authenticate, postActivity);

export default router;
