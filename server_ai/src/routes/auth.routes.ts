import express, { IRouter } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import {
  consumeResetTokenSchema,
  googleAuthUrlSchema,
  googleCallbackSchema,
  refreshTokenSchema,
  verifyTokenSchema,
} from "../validation/auth.zod";
import {
  getUserRequestSchema,
  loginRequestSchema,
  logoutRequestSchema,
  registerRequestSchema,
  requestPasswordResetSchema,
  resetPasswordWithCookieSchema,
} from "../validation/users.zod";
const router: IRouter = express.Router();
router.post(
  "/register",
  validate(registerRequestSchema),
  authController.registerUser
);
router.post("/login", validate(loginRequestSchema), authController.loginUser);
router.post(
  "/logout",
  validate(logoutRequestSchema),
  authController.logoutUser
);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken
);
router.get("/verify", validate(verifyTokenSchema), authController.verifyToken);
router.get(
  "/google/url",
  validate(googleAuthUrlSchema),
  authController.getGoogleAuthUrl
);
router.get(
  "/google/callback",
  validate(googleCallbackSchema),
  authController.handleGoogleCallback
);
router.get(
  "/user/:id",
  validate(getUserRequestSchema),
  authController.getUserById
);
router.post(
  "/password/request-reset",
  validate(requestPasswordResetSchema),
  authController.requestPasswordReset
);
router.get(
  "/password/consume",
  validate(consumeResetTokenSchema),
  authController.consumeResetToken
);
router.post(
  "/password/reset-with-cookie",
  validate(resetPasswordWithCookieSchema),
  authController.resetPasswordWithCookie
);
export default router;
