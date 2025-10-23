import chalk from "chalk";
import { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  const originalSend = res.send;

  res.send = function (body?: any): Response {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const timestamp = new Date().toISOString();

    if (status >= 200 && status < 300) {
      console.log(
        chalk.green(
          `[${timestamp}] [SUCCESS] ${req.method} ${req.originalUrl} - Status: ${status} - ${duration}ms`
        )
      );
    } else {
      console.log(
        chalk.red(
          `[${timestamp}] [FAILED] ${req.method} ${req.originalUrl} - Status: ${status} - ${duration}ms`
        )
      );
    }

    return originalSend.call(this, body);
  };

  next();
};
