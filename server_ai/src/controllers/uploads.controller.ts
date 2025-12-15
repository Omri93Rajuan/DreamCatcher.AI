import { Request, Response } from "express";
import { createAvatarUploadUrl } from "../services/upload.service";
import jwt from "jsonwebtoken";
import { Request } from "express";

const SECRET_KEY = process.env.JWT_ACCESS_SECRET || "fallback_secret_key";

function resolveUserId(req: Request): string {
  // Prefer authenticated user (cookie-based JWT)
  const token = (req as any).cookies?.["auth_token"];
  if (token) {
    try {
      const decoded: any = jwt.verify(token, SECRET_KEY);
      if (decoded?.id) return String(decoded.id);
    } catch {
      // ignore invalid/expired tokens and fallback
    }
  }

  if ((req as any).user?._id) return String((req as any).user._id);
  if ((req as any).userId) return String((req as any).userId);

  return "public";
}

export async function getAvatarUploadUrl(req: Request, res: Response) {
  const userId = resolveUserId(req);
  const { contentType, contentLength } = req.body || {};

  try {
    const result = await createAvatarUploadUrl({
      userId: String(userId),
      contentType: String(contentType || ""),
      contentLength: contentLength ? Number(contentLength) : undefined,
    });

    return res.json({
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
      proxyUrl: result.proxyUrl,
      expiresIn: result.expiresIn,
      maxBytes: result.maxBytes,
      key: result.key,
    });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({
      error: { message: err?.message || "Failed to create upload URL" },
    });
  }
}
