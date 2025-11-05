import { Response } from "express";
import { mapMongoError } from "../helpers/mapMongoError";

/**
 * שליחת שגיאה ללקוח. חשוב: מחזיר void כדי ש-RequestHandler יהיה Promise<void>.
 */
export const handleError = (
  res: Response,
  status: number,
  message: string
): void => {
  res.status(status).json({
    error: {
      status,
      message,
    },
  });
};

/**
 * מיפוי שגיאות Mongo/ולידציה לשגיאת אפליקציה.
 * הכי נקי: זורקים (throw) שגיאה עם status/message.
 * אפשר ללכוד בבקר (controller) ולהחזיר ב-handleError.
 */
export const handleBadRequest = (validator: string, error: any): never => {
  console.error(`[${validator}]`, error);
  const message = mapMongoError(error);

  // זורקים שגיאה עם שדות status/message כדי שה-controller יוכל ללכוד.
  const err = new Error(message) as Error & { status?: number };
  err.status = (error && error.status) || 400;
  throw err;
};
