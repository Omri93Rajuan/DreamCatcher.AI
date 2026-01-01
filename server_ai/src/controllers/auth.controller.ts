import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hashPassword } from "../helpers/bcrypt";
import { buildPasswordResetEmail } from "../helpers/emailTemplates";
import { sendMail } from "../helpers/mailer";
import User from "../models/user";
import {
  getMe,
  login as loginSvc,
  logout as logoutSvc,
  register as registerSvc,
} from "../services/auth.service";
import type { GoogleStatePayload } from "../services/googleAuth.service";
import {
  buildGoogleAuthUrl,
  createGoogleStateToken,
  decodeGoogleStateToken,
  defaultGoogleRedirect,
  exchangeCodeForTokens,
  fetchGoogleProfile,
  sanitizeNextPath,
  sanitizeRedirectUrl,
  upsertGoogleUser,
} from "../services/googleAuth.service";
import {
  canRequestPasswordReset,
  createResetToken,
  stampPasswordReset,
  verifyAndConsumeResetToken,
} from "../services/password.service";
import { handleError } from "../utils/ErrorHandle";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.REFRESH_SECRET;
const RESET_SESSION_SECRET = process.env.JWT_SECRET || ACCESS_SECRET;

if (!ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not configured");
}
if (!REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not configured");
}
if (!RESET_SESSION_SECRET) {
  throw new Error("JWT_SECRET is not configured for reset sessions");
}

const resolvedAppUrl = (process.env.APP_URL || "").toLowerCase();
const apiBaseUrl = (
  process.env.API_URL || `http://localhost:${process.env.PORT || 1000}`
).replace(/\/+$/, "");
const appUrl = resolvedAppUrl;
const isProd = process.env.NODE_ENV === "production";
const RESET_COOKIE = "pw_reset";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const SERVER_GOOGLE_REDIRECT = `${apiBaseUrl}/api/auth/google/callback`;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || SERVER_GOOGLE_REDIRECT;
const DEFAULT_TERMS_VERSION = process.env.TERMS_VERSION || "2025-10-28";
const GOOGLE_ERROR_MESSAGE =
  "Google OAuth is temporarily unavailable, please try again later.";

function ensureGoogleConfig() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    const err: any = new Error("Google OAuth is not configured correctly");
    err.status = 500;
    throw err;
  }
}

const getClientIp = (req: Request) => {
  const forwarded = (req.headers["x-forwarded-for"] as string | undefined)
    ?.split(",")[0]
    ?.trim();
  return forwarded || req.ip || null;
};

const buildGoogleRedirect = (
  base: string | undefined,
  status: "success" | "error",
  next?: string | null,
  message?: string
) => {
  const target = sanitizeRedirectUrl(base);
  const url = new URL(target);
  url.searchParams.set("status", status);
  url.searchParams.set("next", sanitizeNextPath(next));
  if (message) {
    url.searchParams.set("message", message.slice(0, 200));
  }
  return url.toString();
};
const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
  path: "/",
});
function setAccessCookie(res: Response, token: string) {
  res.cookie("auth_token", token, {
    ...buildCookieOptions(),
    maxAge: 15 * 60 * 1000,
  });
}
function setRefreshCookie(res: Response, token: string) {
  res.cookie("refresh_token", token, {
    ...buildCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
function clearAuthCookies(res: Response) {
  const opts = buildCookieOptions();
  res.clearCookie("auth_token", opts);
  res.clearCookie("refresh_token", opts);
  res.clearCookie(RESET_COOKIE, opts);
}

type TokenUser = {
  _id: string;
  role: string;
  email?: string;
};

function issueAuthTokens(res: Response, user: TokenUser) {
  const payload = {
    _id: user._id,
    role: user.role,
    email: user.email,
  };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(
    { _id: user._id, role: user.role },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
}

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    ensureGoogleConfig();
    const requestedMode = String(req.query.mode || "login").toLowerCase();
    const mode = requestedMode === "signup" ? "signup" : "login";
    const redirectTo =
      (req.query.redirectTo as string) || defaultGoogleRedirect;
    const next = (req.query.next as string) || "/";
    const termsAccepted =
      req.query.termsAccepted === "true" || req.query.termsAccepted === "1";
    const termsVersion =
      (req.query.termsVersion as string) || DEFAULT_TERMS_VERSION;
    if (mode === "signup" && (!termsAccepted || !termsVersion)) {
      return handleError(
        res,
        400,
        "Terms must be accepted before Google signup"
      );
    }
    const state = createGoogleStateToken({
      redirectTo,
      next,
      mode,
      termsAccepted: mode === "signup" ? termsAccepted : false,
      termsVersion: mode === "signup" ? termsVersion : null,
      termsLocale:
        (req.query.termsLocale as string) ||
        (req.headers["accept-language"] as string)?.split(",")[0] ||
        null,
      termsUserAgent: req.headers["user-agent"] || null,
    });
    const url = buildGoogleAuthUrl(
      GOOGLE_CLIENT_ID,
      GOOGLE_REDIRECT_URI,
      state
    );
    res.json({ url });
  } catch (error: any) {
    console.error("[GoogleOAuth] url error:", error);
    handleError(
      res,
      error.status || 500,
      error.message || GOOGLE_ERROR_MESSAGE
    );
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  let decoded: GoogleStatePayload | null = null;
  try {
    ensureGoogleConfig();
    const code = req.query.code as string | undefined;
    const stateToken = req.query.state as string | undefined;
    if (!code) throw new Error("Missing authorization code");
    if (!stateToken) throw new Error("Missing state parameter");
    decoded = decodeGoogleStateToken(stateToken);
    if (decoded.mode === "signup" && !decoded.termsAccepted) {
      throw new Error("Terms must be accepted to continue with Google signup");
    }
    const tokens = await exchangeCodeForTokens(
      code,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
    const profile = await fetchGoogleProfile(tokens.access_token);
    const user = await upsertGoogleUser(profile, {
      requireTerms: decoded.mode === "signup",
      allowCreate: decoded.mode === "signup",
      termsVersion: decoded.termsVersion || DEFAULT_TERMS_VERSION,
      termsLocale:
        decoded.termsLocale ||
        profile.locale ||
        (req.headers["accept-language"] as string)?.split(",")[0] ||
        null,
      termsUserAgent:
        decoded.termsUserAgent || req.headers["user-agent"] || null,
      ip: getClientIp(req),
    });
    issueAuthTokens(res, {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    const target = buildGoogleRedirect(
      decoded.redirectTo,
      "success",
      decoded.next
    );
    return res.redirect(302, target);
  } catch (error: any) {
    console.error("[GoogleOAuth] callback error:", error);
    const message = error?.message || GOOGLE_ERROR_MESSAGE;
    const target = buildGoogleRedirect(
      decoded?.redirectTo,
      "error",
      decoded?.next,
      message
    );
    return res.redirect(302, target);
  }
};
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const termsAgreed = !!req.body?.termsAgreed;
    const termsVersion = req.body?.termsVersion as string | undefined;
    if (!termsAgreed || !termsVersion)
      return handleError(res, 400, "Terms must be accepted");
    const user = await registerSvc({
      ...req.body,
      termsAgreed,
      termsVersion,
      termsIp:
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        null,
      termsUserAgent: req.headers["user-agent"] || null,
      termsLocale: (req.headers["accept-language"] as string) || null,
    });
    issueAuthTokens(res, {
      _id: user._id,
      role: user.role,
      email: user.email,
    });
    res.status(201).json({ user });
  } catch (error: any) {
    handleError(
      res,
      error.status || 400,
      error.message || "Registration failed"
    );
  }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await loginSvc(req.body);
    issueAuthTokens(res, {
      _id: user._id,
      role: user.role,
      email: user.email,
    });
    res.status(200).json({ user });
  } catch (error: any) {
    handleError(res, error.status || 401, error.message || "Login failed");
  }
};
export const logoutUser = (_req: Request, res: Response): void => {
  try {
    logoutSvc();
    clearAuthCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
export const refreshToken = (req: Request, res: Response): void => {
  try {
    const rt = req.cookies?.refresh_token as string | undefined;
    if (!rt) return handleError(res, 401, "No refresh token provided");
    jwt.verify(rt, REFRESH_SECRET, (err: any, decoded: any) => {
      if (err || !decoded)
        return handleError(res, 401, "Invalid refresh token");
      const newAccess = jwt.sign(
        { _id: decoded._id, role: decoded.role },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      setAccessCookie(res, newAccess);
      res.json({ ok: true });
    });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
export const verifyToken = (req: Request, res: Response): void => {
  try {
    const fromCookie = req.cookies?.auth_token as string | undefined;
    const auth = req.headers.authorization;
    const fromHeader = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
    const token = fromCookie || fromHeader;
    if (!token) return handleError(res, 401, "No token provided");
    jwt.verify(token, ACCESS_SECRET, (err: any, decoded: any) => {
      if (err || !decoded) return handleError(res, 401, "Invalid token");
      const p = decoded as any;
      res.json({
        valid: true,
        user: { id: p._id, role: p.role, email: p.email },
      });
    });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const foundUser = await getMe(req.params.id);
    if (!foundUser)
      return void res.status(404).json({ message: "User not found" });
    res.status(200).json({ user: foundUser });
  } catch (error: any) {
    handleError(res, 500, error.message);
  }
};
export async function requestPasswordReset(req: Request, res: Response) {
  const { email } = req.body || {};
  if (!email)
    return res.status(400).json({ error: { message: "email_required" } });
  try {
    const user = await User.findOne({ email }).select("_id email");
    if (!user) return res.json({ ok: true });
    const quota = await canRequestPasswordReset(user._id.toString());
    if (!quota.allowed) {
      return res.status(429).json({
        error: { message: "too_many_requests", nextAt: quota.nextAt },
      });
    }
    const { token, expires } = await createResetToken(user._id.toString());
    await stampPasswordReset(user._id.toString());
    const apiBase =
      process.env.API_URL?.replace(/\/+$/, "") ||
      `http://localhost:${process.env.PORT || 1000}`;
    const link = `${apiBase}/api/auth/password/consume?token=${encodeURIComponent(
      token
    )}`;
    const template = buildPasswordResetEmail(link, expires);
    await sendMail(user.email, template.subject, template.html);
    return res.json({ ok: true });
  } catch (e: any) {
    console.warn("[PasswordReset] error:", e);
    const status = e?.status || 500;
    return handleError(
      res,
      status,
      e?.message || "Failed to send password reset email"
    );
  }
}
export async function consumeResetToken(req: Request, res: Response) {
  try {
    const token = String(req.query.token || "");
    if (!token) return res.status(400).send("missing token");
    const user = await verifyAndConsumeResetToken(token);
    if (!user) return res.status(400).send("invalid or expired");
    const session = jwt.sign({ uid: user._id }, RESET_SESSION_SECRET, {
      expiresIn: "10m",
    });
    res.cookie(RESET_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 10 * 60 * 1000,
    });
    const app = (process.env.APP_URL || "http://localhost:5173").replace(
      /\/+$/,
      ""
    );
    return res.redirect(302, `${app}/reset-password`);
  } catch (e) {
    console.error("[consumeResetToken] error:", e);
    return res.status(500).send("server error");
  }
}
export async function resetPasswordWithCookie(req: Request, res: Response) {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword)
      return res.status(400).json({ error: { message: "missing_params" } });
    const raw = req.cookies?.[RESET_COOKIE] as string | undefined;
    if (!raw)
      return res
        .status(401)
        .json({ error: { message: "reset_session_missing" } });
    let decoded: any;
    try {
      decoded = jwt.verify(raw, RESET_SESSION_SECRET);
    } catch {
      return res
        .status(401)
        .json({ error: { message: "reset_session_invalid" } });
    }
    const user = await User.findById(decoded.uid);
    if (!user)
      return res.status(404).json({ error: { message: "user_not_found" } });
    user.password = hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();
    clearAuthCookies(res);
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[resetPasswordWithCookie] error:", e);
    return res
      .status(500)
      .json({ error: { message: e.message || "server_error" } });
  }
}
