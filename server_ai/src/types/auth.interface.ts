import { Request } from "express";

export interface JwtPayload {
  _id?: string;
  id?: string;
  sub?: string;
  role?: string;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: {
    _id: string | null;
    role?: string;
    isAdmin?: boolean;
    [key: string]: any;
  };
}
