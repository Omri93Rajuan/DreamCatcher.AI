import { Router } from "express";
import * as dreamController from "../controllers/dream.controller";

const router = Router();

router.post("/interpret", dreamController.interpretDream);

router.post("/", dreamController.createDream);
router.get("/", dreamController.getAllDreams);

router.get("/:id([0-9a-fA-F]{24})", dreamController.getDreamById);
router.put("/:id([0-9a-fA-F]{24})", dreamController.updateDream);
router.delete("/:id([0-9a-fA-F]{24})", dreamController.deleteDream);

export default router;
