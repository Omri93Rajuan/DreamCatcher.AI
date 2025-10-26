import { Router } from "express";
import * as dreamController from "../controllers/dream.controller";
import * as activityCtrl from "../controllers/dreamActivity.controller";

const router = Router();

// --- נתיבים ספציפיים (חייבים להיות לפני :id) ---
router.post("/interpret", dreamController.interpretDream);
router.get("/popular-week", activityCtrl.getPopularWeek);

// אפשר להחזיר רשימה עם מטריקות/פג'ינציה אם יש לכם:

// פעולות לפי חלום אך עדיין ספציפיות יותר מ-/:id
router.post("/:id([0-9a-fA-F]{24})/activity", activityCtrl.postActivity);
router.get("/:id([0-9a-fA-F]{24})/reactions", activityCtrl.getDreamReactions);

// --- CRUD כללי ---
router.post("/", dreamController.createDream);
router.get("/", dreamController.getAllDreams);

// שים לב להגבלת ה-id כדי שלא יתפוס מיתוגים טקסטואליים
router.get("/:id([0-9a-fA-F]{24})", dreamController.getDreamById);
router.put("/:id([0-9a-fA-F]{24})", dreamController.updateDream);
router.delete("/:id([0-9a-fA-F]{24})", dreamController.deleteDream);

export default router;
