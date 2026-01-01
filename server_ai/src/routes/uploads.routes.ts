import { Router } from "express";
import { getAvatarUploadUrl } from "../controllers/uploads.controller";
import authenticate from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { avatarUploadSchema } from "../validation/uploads.zod";

const router = Router();

router.post(
  "/avatar-url",
  authenticate,
  validate(avatarUploadSchema),
  getAvatarUploadUrl
);

export default router;
