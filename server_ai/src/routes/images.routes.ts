import { Router } from "express";
import { proxyImage } from "../controllers/images.controller";
import { validate } from "../middlewares/validate";
import { proxyImageSchema } from "../validation/images.zod";

const router = Router();

// GET /api/images/<key> (supports nested keys via wildcard)
router.get("/*key", validate(proxyImageSchema), proxyImage);

export default router;
