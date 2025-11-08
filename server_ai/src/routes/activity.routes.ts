import { Router } from "express";
import { postActivity, getDreamReactions, getPopularController, } from "../controllers/dreamActivity.controller";
import authenticateLite from "../middlewares/authenticateLite";
const router = Router();
router.get("/popular", getPopularController);
router.get("/:id/reactions", getDreamReactions);
router.post("/:id", authenticateLite, postActivity);
export default router;
