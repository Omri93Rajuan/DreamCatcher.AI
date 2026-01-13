import { Response } from "express";
import { createAvatarUploadUrl } from "../services/upload.service";
import { AuthRequest } from "../types/auth.interface";

export async function getAvatarUploadUrl(req: AuthRequest, res: Response) {
  const userId = req.user?._id;
  if (!userId) {
    return res
      .status(401)
      .json({ error: { message: "Unauthorized: missing user context" } });
  }
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
