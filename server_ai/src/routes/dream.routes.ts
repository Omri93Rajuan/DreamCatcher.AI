import { Router } from "express";

import * as dreamController from "../controllers/dream.controller";

const router = Router();

router.post("/interpret", dreamController.interpretDream);
router.post("/", dreamController.createDream);
router.get("/", dreamController.getAllDreams);
router.get("/:id", dreamController.getDreamById);
router.put("/:id", dreamController.updateDream);
router.delete("/:id", dreamController.deleteDream);

export default router;
