import "dotenv/config";
import nodemailer from "nodemailer";
function toBool(v?: string) {
  if (!v) return false;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE =
  typeof process.env.SMTP_SECURE === "string"
    ? toBool(process.env.SMTP_SECURE)
    : SMTP_PORT === 465;
const hasSmtp = !!SMTP_HOST && !!SMTP_USER && !!SMTP_PASS;
let transporter: nodemailer.Transporter | null = null;
let warnedMissing = false;
if (hasSmtp) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST!,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    connectionTimeout: Number(process.env.SMTP_CONN_TIMEOUT_MS || 10_000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10_000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 15_000),
    auth: { user: SMTP_USER!, pass: SMTP_PASS! },
  });
}
export async function sendMail(to: string, subject: string, html: string) {
  if (!hasSmtp) {
    if (!warnedMissing) {
      console.warn(
        "[MAIL] SMTP is DISABLED. Missing required env vars (SMTP_HOST/SMTP_USER/SMTP_PASS)."
      );
      warnedMissing = true;
    }
    throw new Error("SMTP not configured");
  }
  const rawFrom = process.env.MAIL_FROM || "no-reply@yourapp.com";
  const from = rawFrom.replace(/^"(.*)"$/, "$1");
  try {
    await transporter!.sendMail({ from, to, subject, html });
  } catch (err) {
    console.error("[MAIL] sendMail failed", err);
    throw err;
  }
}
export async function verifyMailerOnce() {
  if (!hasSmtp) {
    console.warn("[MAIL] SMTP is DISABLED. Missing vars:", {
      SMTP_HOST: !!SMTP_HOST,
      SMTP_USER: !!SMTP_USER,
      SMTP_PASS: !!SMTP_PASS,
    });
    return;
  }
  try {
    await transporter!.verify();
    console.log("[MAIL] transporter.verify(): OK", {
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      user: SMTP_USER,
    });
  } catch (e) {
    console.error("[MAIL] transporter.verify() FAILED:", e);
  }
}
