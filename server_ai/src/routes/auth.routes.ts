import express, { IRouter } from "express";
import * as authController from "../controllers/auth.controller";

const router: IRouter = express.Router();

router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);
router.post("/refresh-token", authController.refreshToken);
router.get("/verify-token", authController.verifyToken);
router.get("/me/:id", authController.getUserById);

export default router;
