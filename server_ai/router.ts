import express, { IRouter, NextFunction, Request, Response } from "express";
import { verifyAdmin } from "./src/middlewares/jwt";
import { requestLogger } from "./src/middlewares/logger";
import authRoutes from "./src/routes/auth.routes";
import dreamRoutes from "./src/routes/dream.routes";
import usersRoutes from "./src/routes/users.routes";
import { handleError } from "./src/utils/ErrorHandle";
import activityRoutes from "./src/routes/activity.routes";
import uploadsRoutes from "./src/routes/uploads.routes";
import imagesRoutes from "./src/routes/images.routes";
const router: IRouter = express.Router();
router.use(requestLogger);
router.get("/healthz", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});
router.use("/api/users", usersRoutes);
router.use("/api/dreams", dreamRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/activity", activityRoutes);
router.use("/api/uploads", uploadsRoutes);
router.use("/api/images", imagesRoutes);
router.use("/admin-role/users", verifyAdmin, usersRoutes);
router.use("/admin-role/product", verifyAdmin, dreamRoutes);
router.use((req: Request, res: Response, next: NextFunction) => {
    next(handleError(res, 404, "The requested resource was not found."));
});
export default router;
