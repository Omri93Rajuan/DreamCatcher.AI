import express, { IRouter } from "express";
import { submitContact } from "../controllers/contact.controller";
import { validate } from "../middlewares/validate";
import { contactRequestSchema } from "../validation/contact.zod";
import rateLimit from "express-rate-limit";

const router: IRouter = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "יותר מדי בקשות, נסה שוב בעוד דקה." } },
});

router.post("/", contactLimiter, validate(contactRequestSchema), submitContact);

export default router;
