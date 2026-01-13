import { Response } from "express";
import { mapMongoError } from "../helpers/mapMongoError";
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
export const handleBadRequest = (validator: string, error: any): never => {
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${validator}]`, error);
  }
  const message = mapMongoError(error);
  const err = new Error(message) as Error & {
    status?: number;
  };
  err.status = (error && error.status) || 400;
  throw err;
};
