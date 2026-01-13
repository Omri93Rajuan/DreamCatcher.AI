import { Request, Response } from "express";
import { pipeline } from "stream";
import { getImageObject } from "../services/image-proxy.service";

const allowedPrefix =
  process.env.IMAGE_PROXY_ALLOWED_PREFIX && process.env.IMAGE_PROXY_ALLOWED_PREFIX !== "*"
    ? process.env.IMAGE_PROXY_ALLOWED_PREFIX
    : "avatars/";

export async function proxyImage(req: Request, res: Response) {
  const key = (req.params[0] || "").replace(/^\/+/, "");
  if (!key) {
    return res.status(400).json({ error: { message: "Missing image key" } });
  }
  if (allowedPrefix && !key.startsWith(allowedPrefix)) {
    return res
      .status(403)
      .json({ error: { message: "Access to this path is not allowed" } });
  }

  try {
    const obj = await getImageObject(key);

    if (obj.contentType) res.setHeader("Content-Type", obj.contentType);
    if (obj.contentLength)
      res.setHeader("Content-Length", obj.contentLength.toString());
    if (obj.lastModified)
      res.setHeader("Last-Modified", obj.lastModified.toUTCString());
    if (obj.etag) res.setHeader("ETag", obj.etag);

    res.setHeader(
      "Cache-Control",
      `public, max-age=${obj.cacheSeconds}, stale-while-revalidate=60`
    );

    pipeline(obj.stream, res, (err) => {
      if (err && !res.headersSent) {
        res.status(502).json({ error: { message: "Failed to stream image" } });
      }
    });
  } catch (err: any) {
    const status = err?.status || err?.$metadata?.httpStatusCode || 500;
    if (status === 404 || err?.name === "NoSuchKey") {
      return res.status(404).json({ error: { message: "Image not found" } });
    }
    console.error("[image-proxy]", err);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: { message: err?.message || "Failed to fetch image" },
    });
  }
}
