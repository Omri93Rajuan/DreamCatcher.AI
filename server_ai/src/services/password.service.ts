import crypto from "crypto";
import User from "../models/user";
import mongoose from "mongoose";
import PasswordResetQuota from "../models/passwordResetToken";

export async function createResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex"); // נשלח במייל
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 דקות

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
  }).select("+password"); // צריך גישה לשדה כדי לעדכן אח"כ

  if (!user) return null;

  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return user;
}
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function canRequestPasswordReset(userId: string) {
  const uid = new mongoose.Types.ObjectId(userId);
  const doc = await PasswordResetQuota.findOne({ userId: uid }).lean();
  if (!doc) {
    return { allowed: true, nextAt: new Date(0) };
  }
  const diff = Date.now() - new Date(doc.lastRequestedAt).getTime();
  const allowed = diff >= ONE_DAY_MS;
  const nextAt = new Date(new Date(doc.lastRequestedAt).getTime() + ONE_DAY_MS);
  return { allowed, nextAt };
}

export async function stampPasswordReset(userId: string) {
  const uid = new mongoose.Types.ObjectId(userId);
  // שים לב: גם $set וגם setDefaultsOnInsert כדי לכתוב lastRequestedAt באפסרט
  await PasswordResetQuota.updateOne(
    { userId: uid },
    {
      $set: { lastRequestedAt: new Date() },
      $setOnInsert: { userId: uid },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
}
