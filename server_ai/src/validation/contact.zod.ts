import { z } from "zod";

const required = (msg: string) => z.string().trim().min(1, { message: msg });

export const contactRequestSchema = z.object({
  body: z.object({
    name: required("Name is required")
      .min(2, { message: "Name must be at least 2 characters" })
      .max(120, { message: "Name must be at most 120 characters" }),

    email: required("Email is required").email({
      message: "Email must be valid",
    }),

    message: required("Message is required")
      .min(10, { message: "Message must be at least 10 characters" })
      .max(2000, { message: "Message must be at most 2000 characters" }),

    website: z.string().max(0, { message: "Invalid submission" }).optional(), // honeypot
  }),
});
