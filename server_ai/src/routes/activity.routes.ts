import { Router } from "express";
import {
  getDreamReactions,
  getPopularController,
  postActivity,
} from "../controllers/dreamActivity.controller";
import authenticateLite from "../middlewares/authenticateLite";
import { validate } from "../middlewares/validate";
import {
  popularSchema,
  postActivitySchema,
  reactionsSchema,
} from "../validation/activity.zod";
const router = Router();
router.get("/popular", validate(popularSchema), getPopularController);
router.get("/:id/reactions", validate(reactionsSchema), getDreamReactions);
router.post(
  "/:id",
  authenticateLite,
  validate(postActivitySchema),
  postActivity
);
export default router;
