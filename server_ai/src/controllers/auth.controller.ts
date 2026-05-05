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
  validateGoogleRedirectUri,
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
const DEFAULT_TERMS_VERSION = process.env.TERMS_VERSION || "2025-10-28";
const GOOGLE_ERROR_MESSAGE =
  "Google OAuth is temporarily unavailable, please try again later.";

function getFirstHeaderValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(",")[0]?.trim() || null;
}

function getRequestBaseUrl(req: Request) {
  const forwardedProto = getFirstHeaderValue(
    req.headers["x-forwarded-proto"] as string | string[] | undefined
  );
  const forwardedHost = getFirstHeaderValue(
    req.headers["x-forwarded-host"] as string | string[] | undefined
  );
  const proto = forwardedProto || req.protocol || "http";
  const host = forwardedHost || req.get("host");
  if (!host) return null;
  return `${proto}://${host}`;
}

function getGoogleRedirectUri(req: Request) {
  const explicit = process.env.GOOGLE_REDIRECT_URI?.trim();
  if (explicit) return validateGoogleRedirectUri(explicit);

  const base =
    process.env.API_URL?.trim() ||
    process.env.SERVER_URL?.trim() ||
    getRequestBaseUrl(req) ||
    `http://localhost:${process.env.PORT || 1000}`;
  return validateGoogleRedirectUri(
    `${base.replace(/\/+$/, "")}/api/auth/google/callback`
  );
}

function ensureGoogleConfig(req: Request) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    const err: any = new Error("Google OAuth is not configured correctly");
    err.status = 500;
    err.code = "google_config_missing";
    throw err;
  }
  return getGoogleRedirectUri(req);
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
  message?: string,
  reason?: string
) => {
  const target = sanitizeRedirectUrl(base);
  const url = new URL(target);
  url.searchParams.set("status", status);
  url.searchParams.set("next", sanitizeNextPath(next));
  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 80));
  }
  if (message) {
    url.searchParams.set("message", message.slice(0, 200));
  }
  return url.toString();
};

function createGoogleFlowError(
  message: string,
  code: string,
  status = 400
) {
  const err: any = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}

function getGoogleErrorReason(error: any) {
  const rawCode = typeof error?.code === "string" ? error.code : "";
  if (/^[a-z0-9_.-]{2,80}$/i.test(rawCode)) return rawCode;
  if (error?.name === "TokenExpiredError") return "state_expired";
  if (error?.name === "JsonWebTokenError") return "invalid_state";
  if (error?.name === "ValidationError") return "user_validation_failed";
  if (error?.name === "MongoServerError") {
    return error?.code === 11000 ? "duplicate_user" : "database_error";
  }
  if (error?.status === 404) return "google_account_not_registered";
  if (error?.status === 401) return "unauthorized";
  if (error?.status === 500) return "server_config_or_runtime_error";
  return "unknown_google_oauth_error";
}

function getUrlOrigin(value?: string | null) {
  if (!value) return null;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function isHttpsUrl(value?: string | null) {
  return getUrlOrigin(value)?.startsWith("https://") || false;
}

function isHttpsRequest(req?: Request) {
  if (!req) return false;
  const forwardedProto = getFirstHeaderValue(
    req.headers["x-forwarded-proto"] as string | string[] | undefined
  );
  return req.secure || forwardedProto === "https";
}

function getCookieClientOrigin(req?: Request, clientUrl?: string | null) {
  return (
    getUrlOrigin(clientUrl) ||
    getUrlOrigin(
      getFirstHeaderValue(req?.headers.origin as string | string[] | undefined)
    ) ||
    getUrlOrigin(process.env.APP_URL) ||
    getUrlOrigin(process.env.CLIENT_URL)
  );
}

function getCookieApiOrigin(req?: Request) {
  return (
    getUrlOrigin(process.env.API_URL) ||
    getUrlOrigin(process.env.SERVER_URL) ||
    getUrlOrigin(req ? getRequestBaseUrl(req) : null)
  );
}

const buildCookieOptions = (req?: Request, clientUrl?: string | null) => {
  const secure =
    isProd ||
    isHttpsRequest(req) ||
    isHttpsUrl(process.env.API_URL) ||
    isHttpsUrl(process.env.SERVER_URL);
  const clientOrigin = getCookieClientOrigin(req, clientUrl);
  const apiOrigin = getCookieApiOrigin(req);
  const crossOriginApi =
    !!clientOrigin && !!apiOrigin && clientOrigin !== apiOrigin;

  return {
    httpOnly: true,
    sameSite: secure && crossOriginApi ? ("none" as const) : ("lax" as const),
    secure,
    path: "/",
  };
};

function setAccessCookie(
  req: Request,
  res: Response,
  token: string,
  clientUrl?: string | null
) {
  res.cookie("auth_token", token, {
    ...buildCookieOptions(req, clientUrl),
    maxAge: 15 * 60 * 1000,
  });
}
function setRefreshCookie(
  req: Request,
  res: Response,
  token: string,
  clientUrl?: string | null
) {
  res.cookie("refresh_token", token, {
    ...buildCookieOptions(req, clientUrl),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
function clearAuthCookies(req: Request, res: Response) {
  const opts = buildCookieOptions(req);
  res.clearCookie("auth_token", opts);
  res.clearCookie("refresh_token", opts);
  res.clearCookie(RESET_COOKIE, opts);
}

type TokenUser = {
  _id: string;
  role: string;
  email?: string;
};

function issueAuthTokens(
  req: Request,
  res: Response,
  user: TokenUser,
  clientUrl?: string | null
) {
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
  setAccessCookie(req, res, accessToken, clientUrl);
  setRefreshCookie(req, res, refreshToken, clientUrl);
  return { accessToken, refreshToken };
}

function toPublicUser(user: any) {
  const publicUser =
    typeof user?.toJSON === "function"
      ? user.toJSON()
      : typeof user?.toObject === "function"
        ? user.toObject()
        : { ...(user || {}) };
  delete publicUser.password;
  if (publicUser._id) publicUser._id = publicUser._id.toString();
  if (!publicUser.name) {
    publicUser.name = `${publicUser.firstName ?? ""} ${
      publicUser.lastName ?? ""
    }`.trim();
  }
  return publicUser;
}

type GoogleCompletionInput = {
  code?: string;
  stateToken?: string;
  oauthError?: string;
  oauthErrorDescription?: string;
};

async function completeGoogleAuthorization(
  req: Request,
  res: Response,
  input: GoogleCompletionInput
) {
  let decoded: GoogleStatePayload | null = null;
  try {
    const googleRedirectUri = ensureGoogleConfig(req);
    const { code, stateToken, oauthError, oauthErrorDescription } = input;
    if (stateToken) {
      decoded = decodeGoogleStateToken(stateToken);
    }
    if (oauthError) {
      throw createGoogleFlowError(
        oauthErrorDescription || `Google authorization failed: ${oauthError}`,
        oauthError
      );
    }
    if (!code) {
      throw createGoogleFlowError(
        "Missing authorization code",
        "missing_authorization_code"
      );
    }
    if (!stateToken) {
      throw createGoogleFlowError("Missing state parameter", "missing_state");
    }
    if (!decoded) decoded = decodeGoogleStateToken(stateToken);
    if (decoded.mode === "signup" && !decoded.termsAccepted) {
      throw createGoogleFlowError(
        "Terms must be accepted to continue with Google signup",
        "terms_not_accepted"
      );
    }
    const tokens = await exchangeCodeForTokens(
      code,
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      googleRedirectUri
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
    issueAuthTokens(
      req,
      res,
      {
        _id: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      decoded.redirectTo
    );
    return { decoded, user: toPublicUser(user) };
  } catch (error: any) {
    error.decoded = decoded;
    throw error;
  }
}

export const getGoogleAuthUrl = (req: Request, res: Response) => {
  try {
    const googleRedirectUri = ensureGoogleConfig(req);
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
      googleRedirectUri,
      state
    );
    res.json({ url });
  } catch (error: any) {
    console.error("[GoogleOAuth] url error:", error);
    handleError(res, error.status || 500, GOOGLE_ERROR_MESSAGE);
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { decoded } = await completeGoogleAuthorization(req, res, {
      code: req.query.code as string | undefined,
      stateToken: req.query.state as string | undefined,
      oauthError: req.query.error as string | undefined,
      oauthErrorDescription: req.query.error_description as string | undefined,
    });
    const target = buildGoogleRedirect(
      decoded.redirectTo,
      "success",
      decoded.next
    );
    return res.redirect(302, target);
  } catch (error: any) {
    console.error("[GoogleOAuth] callback error:", error);
    const decoded = error?.decoded as GoogleStatePayload | null | undefined;
    const reason = getGoogleErrorReason(error);
    const target = buildGoogleRedirect(
      decoded?.redirectTo,
      "error",
      decoded?.next,
      GOOGLE_ERROR_MESSAGE,
      reason
    );
    return res.redirect(302, target);
  }
};

export const completeGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { decoded, user } = await completeGoogleAuthorization(req, res, {
      code: req.body?.code,
      stateToken: req.body?.state,
      oauthError: req.body?.error,
      oauthErrorDescription: req.body?.error_description,
    });
    return res.json({
      ok: true,
      user,
      next: sanitizeNextPath(decoded.next),
    });
  } catch (error: any) {
    console.error("[GoogleOAuth] complete error:", error);
    const status = error.status || 400;
    return res.status(status).json({
      error: {
        status,
        message: GOOGLE_ERROR_MESSAGE,
        code: getGoogleErrorReason(error),
      },
    });
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
    issueAuthTokens(req, res, {
      _id: user._id,
      role: user.role,
      email: user.email,
    });
    res.status(201).json({ user });
  } catch (error: any) {
    const message =
      error?.status === 409 ? "Email already registered" : "Registration failed";
    handleError(
      res,
      error?.status || 400,
      message
    );
  }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await loginSvc(req.body);
    issueAuthTokens(req, res, {
      _id: user._id,
      role: user.role,
      email: user.email,
    });
    res.status(200).json({ user });
  } catch (error: any) {
    const status = error?.status || 401;
    handleError(
      res,
      status,
      status === 401 ? "Invalid email or password" : "Login failed"
    );
  }
};
export const logoutUser = (req: Request, res: Response): void => {
  try {
    logoutSvc();
    clearAuthCookies(req, res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    handleError(res, 500, "Logout failed");
  }
};
export const refreshToken = (req: Request, res: Response): void => {
  try {
    const rt = req.cookies?.refresh_token as string | undefined;
    if (!rt) return handleError(res, 401, "No refresh token provided");
    jwt.verify(rt, REFRESH_SECRET, async (err: any, decoded: any) => {
      if (err || !decoded)
        return handleError(res, 401, "Invalid refresh token");
      const user = await User.findById(decoded._id).select(
        "_id role isActive passwordChangedAt"
      );
      if (!user || user.isActive === false) {
        return handleError(res, 401, "Invalid refresh token");
      }
      if (user.passwordChangedAt && decoded.iat) {
        const issuedAtMs = decoded.iat * 1000;
        if (issuedAtMs < user.passwordChangedAt.getTime()) {
          return handleError(res, 401, "Invalid refresh token");
        }
      }
      const newAccess = jwt.sign(
        { _id: user._id, role: user.role },
        ACCESS_SECRET,
        { expiresIn: "15m" }
      );
      setAccessCookie(req, res, newAccess);
      res.json({ ok: true });
    });
  } catch (error: any) {
    handleError(res, 500, "Could not refresh session");
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
    handleError(res, 500, "Could not verify session");
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
    handleError(res, error.status || 500, "Could not load user");
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
      status === 429
        ? "too_many_requests"
        : "Failed to send password reset email"
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
    const app = (process.env.APP_URL || "http://localhost:5173").replace(
      /\/+$/,
      ""
    );
    res.cookie(RESET_COOKIE, session, {
      ...buildCookieOptions(req, app),
      maxAge: 10 * 60 * 1000,
    });
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
    clearAuthCookies(req, res);
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("[resetPasswordWithCookie] error:", e);
    return res
      .status(500)
      .json({ error: { message: "server_error" } });
  }
}
