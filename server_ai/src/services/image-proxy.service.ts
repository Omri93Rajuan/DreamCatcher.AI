import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const S3_ENDPOINT = (process.env.S3_ENDPOINT || "").replace(/\/+$/, "");
const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_REGION = process.env.S3_REGION || "auto";
const IMAGE_PROXY_CACHE_SECONDS = Number(process.env.IMAGE_PROXY_CACHE_SECONDS || 3600);

function ensureEnv() {
  if (!S3_ENDPOINT || !S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error("S3 configuration missing (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)");
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

export type ImageObject = {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
  lastModified?: Date;
  etag?: string;
  cacheSeconds: number;
};

export async function getImageObject(key: string): Promise<ImageObject> {
  ensureEnv();

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  const res = await s3.send(command);

  if (!res.Body || typeof (res.Body as any).pipe !== "function") {
    throw Object.assign(new Error("Empty body from S3"), { status: 502 });
  }

  return {
    stream: res.Body as unknown as Readable,
    contentType: res.ContentType,
    contentLength: typeof res.ContentLength === "number" ? res.ContentLength : undefined,
    lastModified: res.LastModified,
    etag: res.ETag || undefined,
    cacheSeconds: IMAGE_PROXY_CACHE_SECONDS,
  };
}
