import { Router } from "express";
import { getAvatarUploadUrl } from "../controllers/uploads.controller";

const router = Router();

router.post("/avatar-url", getAvatarUploadUrl);

export default router;
