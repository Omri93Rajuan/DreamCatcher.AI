import { Request, Response } from "express";
import { createAvatarUploadUrl } from "../services/upload.service";

export async function getAvatarUploadUrl(req: Request, res: Response) {
  const userId =
    (req as any).user?._id ||
    (req as any).userId ||
    "public";
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
