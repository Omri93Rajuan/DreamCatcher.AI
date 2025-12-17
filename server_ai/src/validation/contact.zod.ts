import { z } from "zod";

export const contactRequestSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "חסר שם מלא" })
      .min(2, { message: "שם חייב להכיל לפחות 2 תווים" })
      .max(120, { message: "שם ארוך מדי" }),
    email: z
      .string({ required_error: "חסר אימייל" })
      .email({ message: "אימייל לא תקין" }),
    message: z
      .string({ required_error: "חסרה הודעה" })
      .min(10, { message: "הודעה חייבת להיות לפחות 10 תווים" })
      .max(2000, { message: "הודעה ארוכה מדי" }),
    website: z.string().max(0, { message: "Invalid submission" }).optional(), // honeypot field should stay empty
  }),
});
