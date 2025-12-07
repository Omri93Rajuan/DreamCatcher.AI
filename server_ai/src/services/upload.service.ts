import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const S3_ENDPOINT = (process.env.S3_ENDPOINT || "").replace(/\/+$/, "");
const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_REGION = process.env.S3_REGION || "auto";
const PRESIGN_TTL_SECONDS = Number(process.env.PRESIGN_TTL || 300);
const AVATAR_MAX_BYTES = Number(process.env.AVATAR_MAX_BYTES || 2 * 1024 * 1024);
const IMAGE_PROXY_BASE = "/api/images";

function resolvePublicBase(): string {
  const explicit = (process.env.S3_PUBLIC_BASE || "").replace(/\/+$/, "");
  if (explicit && /^https?:\/\//i.test(explicit)) return explicit;
  if (!S3_ENDPOINT || !S3_BUCKET) return "";
  // Default to path-style URL to avoid TLS/host issues on providers like idrive e2
  const normalizedEndpoint = S3_ENDPOINT.startsWith("http")
    ? S3_ENDPOINT
    : `https://${S3_ENDPOINT}`;
  return `${normalizedEndpoint}/${S3_BUCKET}`;
}

const S3_PUBLIC_BASE = resolvePublicBase();

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function ensureEnv() {
  if (!S3_ENDPOINT || !S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error("S3 configuration missing (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)");
  }
  if (!S3_PUBLIC_BASE) {
    throw new Error("S3_PUBLIC_BASE is required to build avatar URLs");
  }
}

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export async function createAvatarUploadUrl(opts: {
  userId: string;
  contentType: string;
  contentLength?: number;
}) {
  ensureEnv();

  const { userId, contentType, contentLength } = opts;

  if (!ALLOWED_MIME.has(contentType)) {
    const err: any = new Error("Unsupported content type");
    err.status = 400;
    throw err;
  }

  if (typeof contentLength === "number" && contentLength > AVATAR_MAX_BYTES) {
    const err: any = new Error("File too large");
    err.status = 413;
    throw err;
  }

  const ext = extFromMime(contentType);
  const key = `avatars/${userId}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: PRESIGN_TTL_SECONDS });
  const publicUrl = S3_PUBLIC_BASE
    ? `${S3_PUBLIC_BASE}/${key}`
    : (() => {
        const u = new URL(uploadUrl);
        u.search = "";
        return u.toString();
      })();

  const proxyUrl = `${IMAGE_PROXY_BASE}/${key}`;

  return { uploadUrl, publicUrl, proxyUrl, key, expiresIn: PRESIGN_TTL_SECONDS, maxBytes: AVATAR_MAX_BYTES };
}
