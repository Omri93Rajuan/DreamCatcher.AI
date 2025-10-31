// src/routes/dream.routes.ts
import { Router } from "express";
import * as dreamController from "../controllers/dream.controller";
import authenticate from "../middlewares/authenticate";
import authenticateLite from "../middlewares/authenticateLite";

const router = Router();

// פירוש → שמירה (תמיד)
router.post("/interpret", authenticate, dreamController.interpretDream);

// יצירה ידנית (אם aiResponse קיים – נשמר ישירות)
router.post("/", authenticate, dreamController.createDream);

// פיד ציבורי ושליפות
router.get("/", authenticateLite, dreamController.getAllDreams);
router.get("/stats", authenticateLite, dreamController.getDreamStats);
router.get("/:id([0-9a-fA-F]{24})", authenticate, dreamController.getDreamById);

// עדכון/מחיקה (מוגן)
router.put("/:id([0-9a-fA-F]{24})", authenticate, dreamController.updateDream);
router.delete(
  "/:id([0-9a-fA-F]{24})",
  authenticate,
  dreamController.deleteDream
);

export default router;
