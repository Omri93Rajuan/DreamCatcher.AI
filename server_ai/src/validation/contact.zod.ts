import { z } from "zod";

const required = (msg: string) =>
  z.string({
    error: (iss) => (iss.input === undefined ? msg : "ערך לא תקין"),
  });

export const contactRequestSchema = z.object({
  body: z.object({
    name: required("חסר שם מלא")
      .min(2, { error: "שם חייב להכיל לפחות 2 תווים" })
      .max(120, { error: "שם ארוך מדי" }),

    email: required("חסר אימייל")
      .min(1, { error: "חסר אימייל" })
      .email({ error: "אימייל לא תקין" }),

    message: required("חסרה הודעה")
      .min(10, { error: "הודעה חייבת להיות לפחות 10 תווים" })
      .max(2000, { error: "הודעה ארוכה מדי" }),

    website: z.string().max(0, { error: "Invalid submission" }).optional(), // honeypot
  }),
});
