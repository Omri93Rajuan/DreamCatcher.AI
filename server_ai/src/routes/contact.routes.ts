import express, { IRouter } from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "../controllers/contact.controller";
import { validate } from "../middlewares/validate";
import { contactRequestSchema } from "../validation/contact.zod";

const router: IRouter = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later." } },
});

const limiter =
  process.env.NODE_ENV === "test"
    ? (_req: any, _res: any, next: any) => next()
    : contactLimiter;

router.post("/", limiter, validate(contactRequestSchema), submitContact);

export default router;
