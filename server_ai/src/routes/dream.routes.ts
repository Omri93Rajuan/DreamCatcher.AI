import { Router } from "express";
import * as dreamController from "../controllers/dream.controller";
import authenticate from "../middlewares/authenticate";
import authenticateLite from "../middlewares/authenticateLite";
import { validate } from "../middlewares/validate";
import {
  createDreamRequestSchema,
  deleteDreamRequestSchema,
  dreamStatsRequestSchema,
  getDreamRequestSchema,
  interpretDreamRequestSchema,
  listDreamsRequestSchema,
  updateDreamRequestSchema,
} from "../validation/dream.zod";
const router = Router();
router.post(
  "/interpret",
  authenticate,
  validate(interpretDreamRequestSchema),
  dreamController.interpretDream
);
router.post(
  "/",
  authenticate,
  validate(createDreamRequestSchema),
  dreamController.createDream
);
router.get(
  "/",
  authenticateLite,
  validate(listDreamsRequestSchema),
  dreamController.getAllDreams
);
router.get(
  "/stats",
  authenticateLite,
  validate(dreamStatsRequestSchema),
  dreamController.getDreamStats
);
router.get(
  "/:id([0-9a-fA-F]{24})",
  authenticateLite,
  validate(getDreamRequestSchema),
  dreamController.getDreamById
);
router.put(
  "/:id([0-9a-fA-F]{24})",
  authenticate,
  validate(updateDreamRequestSchema),
  dreamController.updateDream
);
router.delete(
  "/:id([0-9a-fA-F]{24})",
  authenticate,
  validate(deleteDreamRequestSchema),
  dreamController.deleteDream
);
export default router;
