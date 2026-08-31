function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export type RateLimitPolicy = {
  windowMs: number;
  max: number;
};

export const RATE_LIMIT_POLICIES = {
  login: {
    windowMs: positiveInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MINUTES, 15) * 60_000,
    max: positiveInt(process.env.RATE_LIMIT_LOGIN_MAX, 10),
  },
  register: {
    windowMs: positiveInt(process.env.RATE_LIMIT_REGISTER_WINDOW_MINUTES, 60) * 60_000,
    max: positiveInt(process.env.RATE_LIMIT_REGISTER_MAX, 5),
  },
  passwordReset: {
    windowMs: positiveInt(process.env.RATE_LIMIT_PASSWORD_WINDOW_MINUTES, 60) * 60_000,
    max: positiveInt(process.env.RATE_LIMIT_PASSWORD_MAX, 5),
  },
  refresh: {
    windowMs: positiveInt(process.env.RATE_LIMIT_REFRESH_WINDOW_MINUTES, 15) * 60_000,
    max: positiveInt(process.env.RATE_LIMIT_REFRESH_MAX, 60),
  },
  aiPerUser: {
    windowMs: positiveInt(process.env.RATE_LIMIT_AI_WINDOW_HOURS, 24) * 3_600_000,
    max: positiveInt(process.env.RATE_LIMIT_AI_USER_MAX, 20),
  },
  aiPerIp: {
    windowMs: positiveInt(process.env.RATE_LIMIT_AI_WINDOW_HOURS, 24) * 3_600_000,
    max: positiveInt(process.env.RATE_LIMIT_AI_IP_MAX, 40),
  },
  uploadPerUser: {
    windowMs: positiveInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MINUTES, 60) * 60_000,
    max: positiveInt(process.env.RATE_LIMIT_UPLOAD_USER_MAX, 30),
  },
} satisfies Record<string, RateLimitPolicy>;
