import crypto from "crypto";
import { Types } from "mongoose";
import { SiteVisit } from "../models/siteVisit";

const dayBucket = (date = new Date()) => date.toISOString().slice(0, 10);

const hashValue = (value?: string | null) =>
  value ? crypto.createHash("sha256").update(value).digest("hex") : null;

function cleanPath(path?: string | null) {
  const raw = String(path || "/").trim();
  if (!raw.startsWith("/")) return "/";
  return raw.slice(0, 240);
}

export async function recordSiteVisit(args: {
  userId?: string | null;
  sessionId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  path?: string | null;
}) {
  const day = dayBucket();
  const fallbackSession = `${args.ip || "anonymous"}:${
    args.userAgent || "unknown"
  }:${day}`;
  const sessionIdHash = hashValue(args.sessionId || fallbackSession);

  if (!sessionIdHash) {
    return { ok: false as const, reason: "missing_session" as const };
  }

  const userId =
    args.userId && Types.ObjectId.isValid(args.userId)
      ? new Types.ObjectId(args.userId)
      : null;

  const result = await SiteVisit.updateOne(
    { sessionIdHash, dayBucket: day },
    {
      $setOnInsert: {
        userId,
        sessionIdHash,
        ipHash: hashValue(args.ip),
        userAgentHash: hashValue(args.userAgent),
        path: cleanPath(args.path),
        dayBucket: day,
        createdAt: new Date(),
      },
      $set: { lastSeenAt: new Date() },
    },
    { upsert: true }
  );

  return {
    ok: true as const,
    created: (result as any).upsertedCount === 1,
  };
}
