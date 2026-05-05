import { randomBytes } from "crypto";
import { isIP } from "net";
import jwt from "jsonwebtoken";
import { hashPassword } from "../helpers/bcrypt";
import User from "../models/user";

const DEFAULT_APP_URL = (
  process.env.APP_URL || process.env.CLIENT_URL || "http://localhost:5173"
).replace(/\/+$/, "");
const APP_URL = DEFAULT_APP_URL;
const APP_URL_ORIGIN = new URL(APP_URL).origin;
const DEFAULT_GOOGLE_REDIRECT = `${APP_URL}/auth/google/callback`;
const CLIENT_REDIRECT_ORIGINS = new Set(
  [APP_URL, process.env.CLIENT_URL, process.env.CORS_ORIGINS]
    .flatMap((value) => (value || "").split(","))
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => !!value)
);
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_STATE_SECRET =
  process.env.GOOGLE_STATE_SECRET || process.env.JWT_SECRET || "supersecret";
const DEFAULT_TERMS_VERSION = process.env.TERMS_VERSION || "2025-10-28";

export type GoogleMode = "login" | "signup";

export interface GoogleStatePayload {
  nonce: string;
  redirectTo: string;
  next: string;
  mode: GoogleMode;
  termsAccepted: boolean;
  termsVersion: string | null;
  termsLocale: string | null;
  termsUserAgent: string | null;
}

export interface CreateStateInput {
  redirectTo: string;
  next?: string | null;
  mode?: GoogleMode;
  termsAccepted?: boolean;
  termsVersion?: string | null;
  termsLocale?: string | null;
  termsUserAgent?: string | null;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  refresh_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export interface GoogleProfile {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface UpsertGoogleUserOptions {
  requireTerms?: boolean;
  termsVersion?: string | null;
  termsLocale?: string | null;
  termsUserAgent?: string | null;
  ip?: string | null;
  allowCreate?: boolean;
}

export const sanitizeNextPath = (value?: string | null): string => {
  if (!value || typeof value !== "string") return "/";
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return "/";
  if (trimmed.startsWith("//")) return "/";
  if (trimmed.includes("://")) return "/";
  return trimmed || "/";
};

export const sanitizeRedirectUrl = (
  candidate?: string | null,
  fallback = DEFAULT_GOOGLE_REDIRECT
): string => {
  if (!candidate || typeof candidate !== "string") return fallback;
  const trimmed = candidate.trim();
  if (!trimmed) return fallback;
  try {
    const parsed = new URL(trimmed, APP_URL);
    if (
      parsed.origin !== APP_URL_ORIGIN &&
      !CLIENT_REDIRECT_ORIGINS.has(parsed.origin)
    ) {
      return fallback;
    }
    return parsed.toString();
  } catch {
    return fallback;
  }
};

export const defaultGoogleRedirect = DEFAULT_GOOGLE_REDIRECT;

export const createGoogleStateToken = (input: CreateStateInput): string => {
  const payload: GoogleStatePayload = {
    nonce: randomBytes(12).toString("hex"),
    redirectTo: sanitizeRedirectUrl(input.redirectTo),
    next: sanitizeNextPath(input.next),
    mode: input.mode || "login",
    termsAccepted: !!input.termsAccepted,
    termsVersion: input.termsVersion || null,
    termsLocale: input.termsLocale || null,
    termsUserAgent: input.termsUserAgent || null,
  };
  return jwt.sign(payload, GOOGLE_STATE_SECRET, { expiresIn: "10m" });
};

export const decodeGoogleStateToken = (token: string): GoogleStatePayload => {
  return jwt.verify(token, GOOGLE_STATE_SECRET) as GoogleStatePayload;
};

export const buildGoogleAuthUrl = (
  clientId: string,
  redirectUri: string,
  state: string,
  scope: string[] = ["openid", "email", "profile"]
) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

const toError = (message: string, status = 400, code?: string) => {
  const err: any = new Error(message);
  err.status = status;
  if (code) err.code = code;
  return err;
};

const normalizeHost = (host: string) =>
  host.trim().toLowerCase().replace(/^\[/, "").replace(/\]$/, "");

export const isLocalhostHost = (host: string) => {
  const normalized = normalizeHost(host);
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
};

export const validateGoogleRedirectUri = (
  redirectUri: string,
  options: { production?: boolean } = {}
) => {
  const production = options.production ?? process.env.NODE_ENV === "production";
  let parsed: URL;
  try {
    parsed = new URL(redirectUri.trim());
  } catch {
    throw toError(
      "Google redirect URI must be a valid absolute URL",
      500,
      "redirect_uri_invalid"
    );
  }

  const isLocal = isLocalhostHost(parsed.hostname);
  if (parsed.hash) {
    throw toError(
      "Google redirect URI must not include a URL fragment",
      500,
      "redirect_uri_has_fragment"
    );
  }
  if (parsed.username || parsed.password) {
    throw toError(
      "Google redirect URI must not include credentials",
      500,
      "redirect_uri_has_credentials"
    );
  }
  if (production && isLocal) {
    throw toError(
      "Google redirect URI cannot use localhost in production",
      500,
      "redirect_uri_localhost_production"
    );
  }
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLocal)) {
    throw toError(
      "Google redirect URI must use HTTPS outside localhost",
      500,
      "redirect_uri_not_https"
    );
  }
  if (!isLocal && isIP(normalizeHost(parsed.hostname))) {
    throw toError(
      "Google redirect URI cannot use a raw IP address",
      500,
      "redirect_uri_raw_ip"
    );
  }

  return parsed.toString();
};

export const exchangeCodeForTokens = async (
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<GoogleTokenResponse> => {
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = (await response.json()) as GoogleTokenResponse;
  if (!response.ok) {
    throw toError(
      data.error_description || "Failed to exchange authorization code",
      response.status,
      data.error || "token_exchange_failed"
    );
  }
  if (!data.access_token) {
    throw toError(
      "Google token response missing access_token",
      502,
      "missing_access_token"
    );
  }
  return data;
};

export const fetchGoogleProfile = async (
  accessToken: string
): Promise<GoogleProfile> => {
  const response: Response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw toError(
      "Failed to fetch Google profile",
      response.status,
      "profile_fetch_failed"
    );
  }
  return (await response.json()) as GoogleProfile;
};

const parseNames = (
  profile: GoogleProfile
): { firstName: string; lastName: string } => {
  const first = profile.given_name?.trim();
  const last = profile.family_name?.trim();
  if (first && last) {
    return { firstName: first, lastName: last };
  }
  if (profile.name) {
    const parts = profile.name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "User" };
    }
  }
  return { firstName: "Google", lastName: "User" };
};

export const upsertGoogleUser = async (
  profile: GoogleProfile,
  options: UpsertGoogleUserOptions = {}
) => {
  if (!profile?.sub) {
    throw toError("Google profile missing user id", 400, "profile_missing_sub");
  }
  const email = profile.email?.toLowerCase();
  if (!email) {
    throw toError("Google profile missing email", 400, "profile_missing_email");
  }
  const requireTerms = !!options.requireTerms;
  const effectiveTermsVersion = options.termsVersion || DEFAULT_TERMS_VERSION;
  if (requireTerms && !effectiveTermsVersion) {
    throw toError(
      "Terms version is required for Google signup",
      400,
      "terms_version_missing"
    );
  }
  let user = await User.findOne({ googleId: profile.sub });
  if (!user && email) {
    user = await User.findOne({ email });
  }
  const avatar = normalizeGoogleAvatar(profile.picture);
  if (!user) {
    if (!options.allowCreate) {
      throw toError(
        "Google account is not registered",
        404,
        "google_account_not_registered"
      );
    }
    const { firstName, lastName } = parseNames(profile);
    const randomPassword = hashPassword(randomBytes(32).toString("hex"));
    user = await User.create({
      firstName,
      lastName,
      email,
      password: randomPassword,
      image: avatar,
      googleId: profile.sub,
      isActive: true,
      lastLogin: new Date(),
      termsAccepted: requireTerms,
      termsAcceptedAt: requireTerms ? new Date() : undefined,
      termsVersion: effectiveTermsVersion,
      termsIp: options.ip ?? null,
      termsUserAgent: options.termsUserAgent ?? null,
      termsLocale: options.termsLocale ?? profile.locale ?? null,
    });
    return user;
  }
  let shouldSave = false;
  if (!user.googleId) {
    user.googleId = profile.sub;
    shouldSave = true;
  }
  if (avatar && user.image !== avatar) {
    user.image = avatar;
    shouldSave = true;
  }
  if (!user.termsAccepted && options.termsVersion) {
    user.termsAccepted = true;
    user.termsAcceptedAt = new Date();
    user.termsVersion = options.termsVersion;
    user.termsIp = options.ip ?? user.termsIp ?? null;
    user.termsLocale = options.termsLocale ?? user.termsLocale ?? null;
    user.termsUserAgent = options.termsUserAgent ?? user.termsUserAgent ?? null;
    shouldSave = true;
  }
  user.lastLogin = new Date();
  shouldSave = true;
  if (shouldSave) {
    await user.save();
  }
  return user;
};

export function normalizeGoogleAvatar(picture?: string | null) {
  if (!picture) return null;
  try {
    const url = new URL(picture);
    const looksLikeAvatar =
      url.hostname.includes("googleusercontent.com") &&
      /^\/[a-z]\/.+/i.test(url.pathname);
    if (!url.search) {
      if (looksLikeAvatar) {
        url.search = "?sz=256";
        return url.toString();
      }
      url.searchParams.set("sz", "256");
      return url.toString();
    }
    url.searchParams.set("sz", "256");
    return url.toString();
  } catch {
    if (picture.includes("=s96-c")) return picture.replace("=s96-c", "=s256-c");
    if (picture.includes("/a/") && !picture.includes("=")) {
      return `${picture}=s256-c`;
    }
    return picture;
  }
}
