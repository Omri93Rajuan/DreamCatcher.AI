import express, { IRouter } from "express";
import * as authController from "../controllers/auth.controller";
import authenticate from "../middlewares/authenticate";
import {
  loginLimiter,
  passwordResetLimiter,
  refreshLimiter,
  registerLimiter,
} from "../middlewares/rateLimiters";
import { validate } from "../middlewares/validate";
import {
  consumeResetTokenSchema,
  googleAuthUrlSchema,
  googleCallbackSchema,
  googleCompleteSchema,
  refreshTokenSchema,
  verifyTokenSchema,
} from "../validation/auth.zod";
import {
  loginRequestSchema,
  logoutRequestSchema,
  registerRequestSchema,
  requestPasswordResetSchema,
  resetPasswordWithCookieSchema,
} from "../validation/users.zod";
const router: IRouter = express.Router();
router.post(
  "/register",
  registerLimiter,
  validate(registerRequestSchema),
  authController.registerUser
);
router.post("/login", loginLimiter, validate(loginRequestSchema), authController.loginUser);
router.post(
  "/logout",
  validate(logoutRequestSchema),
  authController.logoutUser
);
router.post(
  "/refresh",
  refreshLimiter,
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
router.post(
  "/google/complete",
  validate(googleCompleteSchema),
  authController.completeGoogleCallback
);
router.get("/me", authenticate, authController.getCurrentUser);
router.post(
  "/password/request-reset",
  passwordResetLimiter,
  validate(requestPasswordResetSchema),
  authController.requestPasswordReset
);
router.get(
  "/password/consume",
  passwordResetLimiter,
  validate(consumeResetTokenSchema),
  authController.consumeResetToken
);
router.post(
  "/password/reset-with-cookie",
  passwordResetLimiter,
  validate(resetPasswordWithCookieSchema),
  authController.resetPasswordWithCookie
);
export default router;
