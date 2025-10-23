import { Response } from "express";
import { mapMongoError } from "../helpers/mapMongoError";

const handleError = (
  res: Response,
  status: number,
  message: string
): Response => {
  return res.status(status).json({
    error: {
      status,
      message,
    },
  });
};

const handleBadRequest = async (validator: string, error: any) => {
  console.error(`[${validator}]`, error);

  const message = mapMongoError(error);

  return Promise.reject({
    status: error.status || 400,
    message,
  });
};
export { handleError, handleBadRequest };
