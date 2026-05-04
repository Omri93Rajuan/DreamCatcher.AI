import { Router } from "express";
import { postSiteVisit } from "../controllers/siteVisit.controller";
import authenticateLite from "../middlewares/authenticateLite";
import { validate } from "../middlewares/validate";
import { recordVisitRequestSchema } from "../validation/visits.zod";

const router = Router();

router.post("/", authenticateLite, validate(recordVisitRequestSchema), postSiteVisit);

export default router;
