import crypto from "crypto";
import mongoose from "mongoose";
import PasswordResetQuota from "../models/passwordResetToken";
import User from "../models/user";
export async function createResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000);
  await User.findByIdAndUpdate(userId, {
    resetPasswordTokenHash: hash,
    resetPasswordExpiresAt: expires,
  });
  return { token, expires };
}
export async function verifyAndConsumeResetToken(token: string) {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date();
  const user = await User.findOne({
    resetPasswordTokenHash: hash,
    resetPasswordExpiresAt: { $gt: now },
  }).select("+password");
  if (!user) return null;
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();
  return user;
}
const REQUEST_INTERVAL_MINUTES = Number(
  process.env.RESET_REQUEST_INTERVAL_MINUTES || 24 * 60
);
const REQUEST_INTERVAL_MS = REQUEST_INTERVAL_MINUTES * 60 * 1000;
export async function canRequestPasswordReset(userId: string) {
  const uid = new mongoose.Types.ObjectId(userId);
  const doc = await PasswordResetQuota.findOne({ userId: uid }).lean();
  if (!doc) {
    return { allowed: true, nextAt: new Date(0) };
  }
  const diff = Date.now() - new Date(doc.lastRequestedAt).getTime();
  const allowed = diff >= REQUEST_INTERVAL_MS;
  const nextAt = new Date(
    new Date(doc.lastRequestedAt).getTime() + REQUEST_INTERVAL_MS
  );
  return { allowed, nextAt };
}
export async function stampPasswordReset(userId: string) {
  const uid = new mongoose.Types.ObjectId(userId);
  await PasswordResetQuota.updateOne(
    { userId: uid },
    {
      $set: { lastRequestedAt: new Date() },
      $setOnInsert: { userId: uid },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
}
