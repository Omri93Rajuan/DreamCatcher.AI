import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getMe, login as loginSvc, logout as logoutSvc, register as registerSvc, } from "../services/auth.service";
import { handleError } from "../utils/ErrorHandle";
import { sendMail } from "../helpers/mailer";
import { hashPassword } from "../helpers/bcrypt";
import User from "../models/user";
import { canRequestPasswordReset, createResetToken, stampPasswordReset, verifyAndConsumeResetToken, } from "../services/password.service";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "supersecret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ||
    process.env.REFRESH_SECRET ||
    "refreshsecret";
const appUrl = (process.env.APP_URL || "").toLowerCase();
const isHttps = appUrl.startsWith("https://");
const isProd = process.env.NODE_ENV === "production" && isHttps;
const RESET_COOKIE = "pw_reset";
const RESET_SESSION_SECRET = process.env.JWT_SECRET || "supersecret";
function setAccessCookie(res: Response, token: string) {
    res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 15 * 60 * 1000,
    });
}
function setRefreshCookie(res: Response, token: string) {
    res.cookie("refresh_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isProd,
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
function clearAuthCookies(res: Response) {
    res.clearCookie("auth_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.clearCookie(RESET_COOKIE, { path: "/" });
}
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const termsAgreed = !!req.body?.termsAgreed;
        const termsVersion = req.body?.termsVersion as string | undefined;
        if (!termsAgreed || !termsVersion)
            return handleError(res, 400, "Terms must be accepted");
        const user = await registerSvc({
            ...req.body,
            termsAgreed,
            termsVersion,
            termsIp: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
                req.ip ||
                null,
            termsUserAgent: req.headers["user-agent"] || null,
            termsLocale: (req.headers["accept-language"] as string) || null,
        });
        const accessToken = jwt.sign({ _id: user._id, role: user.role, email: user.email }, ACCESS_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ _id: user._id, role: user.role }, REFRESH_SECRET, { expiresIn: "7d" });
        setAccessCookie(res, accessToken);
        setRefreshCookie(res, refreshToken);
        res.status(201).json({ user });
    }
    catch (error: any) {
        handleError(res, error.status || 400, error.message || "Registration failed");
    }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await loginSvc(req.body);
        const accessToken = jwt.sign({ _id: user._id, role: user.role, email: user.email }, ACCESS_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ _id: user._id, role: user.role }, REFRESH_SECRET, { expiresIn: "7d" });
        setAccessCookie(res, accessToken);
        setRefreshCookie(res, refreshToken);
        res.status(200).json({ user });
    }
    catch (error: any) {
        handleError(res, error.status || 401, error.message || "Login failed");
    }
};
export const logoutUser = (_req: Request, res: Response): void => {
    try {
        logoutSvc();
        clearAuthCookies(res);
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error: any) {
        handleError(res, 500, error.message);
    }
};
export const refreshToken = (req: Request, res: Response): void => {
    try {
        const rt = req.cookies?.refresh_token as string | undefined;
        if (!rt)
            return handleError(res, 401, "No refresh token provided");
        jwt.verify(rt, REFRESH_SECRET, (err: any, decoded: any) => {
            if (err || !decoded)
                return handleError(res, 401, "Invalid refresh token");
            const newAccess = jwt.sign({ _id: decoded._id, role: decoded.role }, ACCESS_SECRET, { expiresIn: "15m" });
            setAccessCookie(res, newAccess);
            res.json({ ok: true });
        });
    }
    catch (error: any) {
        handleError(res, 500, error.message);
    }
};
export const verifyToken = (req: Request, res: Response): void => {
    try {
        const fromCookie = req.cookies?.auth_token as string | undefined;
        const auth = req.headers.authorization;
        const fromHeader = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
        const token = fromCookie || fromHeader;
        if (!token)
            return handleError(res, 401, "No token provided");
        jwt.verify(token, ACCESS_SECRET, (err: any, decoded: any) => {
            if (err || !decoded)
                return handleError(res, 401, "Invalid token");
            const p = decoded as any;
            res.json({
                valid: true,
                user: { id: p._id, role: p.role, email: p.email },
            });
        });
    }
    catch (error: any) {
        handleError(res, 500, error.message);
    }
};
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const foundUser = await getMe(req.params.id);
        if (!foundUser)
            return void res.status(404).json({ message: "User not found" });
        res.status(200).json({ user: foundUser });
    }
    catch (error: any) {
        handleError(res, 500, error.message);
    }
};
export async function requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body || {};
    if (!email)
        return res.status(400).json({ error: { message: "email_required" } });
    try {
        const user = await User.findOne({ email }).select("_id email");
        if (!user)
            return res.json({ ok: true });
        const quota = await canRequestPasswordReset(user._id.toString());
        if (!quota.allowed) {
            return res.status(429).json({
                error: { message: "too_many_requests", nextAt: quota.nextAt },
            });
        }
        const { token, expires } = await createResetToken(user._id.toString());
        await stampPasswordReset(user._id.toString());
        const apiBase = process.env.API_URL?.replace(/\/+$/, "") ||
            `http://localhost:${process.env.PORT || 1000}`;
        const link = `${apiBase}/api/auth/password/consume?token=${encodeURIComponent(token)}`;
        const html = `
      <div dir="rtl" style="font-family:Arial,sans-serif">
        <h2>איפוס סיסמה</h2>
        <p>להגדרת סיסמה חדשה לחץ/י על הקישור:</p>
        <p><a href="${link}">${link}</a></p>
        <p>תוקף הקישור עד: ${expires.toLocaleString("he-IL")}</p>
      </div>
    `;
        await sendMail(user.email, "איפוס סיסמה", html);
        return res.json({ ok: true });
    }
    catch (e) {
        console.warn("[PasswordReset] error:", e);
        return res.json({ ok: true });
    }
}
export async function consumeResetToken(req: Request, res: Response) {
    try {
        const token = String(req.query.token || "");
        if (!token)
            return res.status(400).send("missing token");
        const user = await verifyAndConsumeResetToken(token);
        if (!user)
            return res.status(400).send("invalid or expired");
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
        const app = (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, "");
        return res.redirect(302, `${app}/reset-password`);
    }
    catch (e) {
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
        }
        catch {
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
    }
    catch (e: any) {
        console.error("[resetPasswordWithCookie] error:", e);
        return res
            .status(500)
            .json({ error: { message: e.message || "server_error" } });
    }
}
