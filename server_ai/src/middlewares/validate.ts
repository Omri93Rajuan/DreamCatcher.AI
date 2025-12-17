import type { RequestHandler } from "express";
import type { ZodType } from "zod";

export const validate =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return res
        .status(400)
        .json({ success: false, error: "validation_error", issues });
    }

    const data: any = parsed.data;
    if (data?.body !== undefined) req.body = data.body;
    if (data?.params !== undefined) req.params = data.params;
    if (data?.query !== undefined) req.query = data.query;

    return next();
  };
