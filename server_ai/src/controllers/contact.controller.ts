import { Request, Response } from "express";
import { sendMail } from "../helpers/mailer";
import { handleError } from "../utils/ErrorHandle";

const CONTACT_TO = process.env.CONTACT_FORM_TO || process.env.MAIL_FROM;
const CONTACT_SUBJECT =
  process.env.CONTACT_FORM_SUBJECT || "New contact form message";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitContact(req: Request, res: Response) {
  if (!CONTACT_TO) {
    return handleError(
      res,
      500,
      "Contact email is not configured on the server"
    );
  }

  const { name, email, message } = req.body as {
    name: string;
    email: string;
    message: string;
    website?: string;
  };

  // Honeypot: reject obvious bot submissions that fill the hidden field
  if (typeof (req.body as any).website === "string" && (req.body as any).website.trim().length > 0) {
    return handleError(res, 400, "Invalid submission");
  }

  try {
    const html = `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    await sendMail(CONTACT_TO, CONTACT_SUBJECT, html);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("[CONTACT] Failed to send contact message", error);
    return handleError(res, 500, "Failed to send message. Please try again.");
  }
}
