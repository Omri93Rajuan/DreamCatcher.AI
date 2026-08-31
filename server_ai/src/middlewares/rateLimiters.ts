import type { Request } from "express";
import rateLimit from "express-rate-limit";
import { RATE_LIMIT_POLICIES, type RateLimitPolicy } from "../config/rateLimits";
import type { AuthRequest } from "../types/auth.interface";

const skipInTests = () =>
  process.env.NODE_ENV === "test" &&
  process.env.RATE_LIMIT_ENABLE_IN_TESTS !== "true";

function createLimiter(
  policy: RateLimitPolicy,
  keyGenerator?: (req: Request) => string
) {
  return rateLimit({
    windowMs: policy.windowMs,
    max: policy.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipInTests,
    ...(keyGenerator ? { keyGenerator } : {}),
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: "rate_limited",
        message: "Too many requests. Please try again later.",
      });
    },
  });
}

const userKey = (req: Request) => {
  const userId = (req as AuthRequest).user?._id;
  return `user:${userId || "unknown"}`;
};

export const loginLimiter = createLimiter(RATE_LIMIT_POLICIES.login);
export const registerLimiter = createLimiter(RATE_LIMIT_POLICIES.register);
export const passwordResetLimiter = createLimiter(
  RATE_LIMIT_POLICIES.passwordReset
);
export const refreshLimiter = createLimiter(RATE_LIMIT_POLICIES.refresh);
export const aiIpLimiter = createLimiter(RATE_LIMIT_POLICIES.aiPerIp);
export const aiUserLimiter = createLimiter(
  RATE_LIMIT_POLICIES.aiPerUser,
  userKey
);
export const uploadUserLimiter = createLimiter(
  RATE_LIMIT_POLICIES.uploadPerUser,
  userKey
);
