import { Router } from "express";
import { proxyImage } from "../controllers/images.controller";

const router = Router();

// GET /api/images/<key> (supports nested keys via wildcard)
router.get("/*", proxyImage);

export default router;
