import type { Request } from "express";
import type { IncomingHttpHeaders } from "http";
export interface JwtPayload {
    _id?: string;
    id?: string;
    sub?: string;
    role?: string;
    exp?: number;
}
export interface AuthRequest<
    Params extends Record<string, string | undefined> = Record<string, string | undefined>,
    ResBody = unknown,
    ReqBody extends Record<string, unknown> = Record<string, unknown>,
    ReqQuery extends Record<string, string | undefined> = Record<string, string | undefined>,
    Locals extends Record<string, any> = Record<string, any>,
> extends Request<Params, ResBody, ReqBody, ReqQuery, Locals> {
    user?: {
        _id: string | null;
        role?: string;
        isAdmin?: boolean;
        [key: string]: any;
    };
    params: Params;
    body: ReqBody;
    query: ReqQuery;
    headers: IncomingHttpHeaders;
    cookies: Record<string, string | undefined>;
    ip: string;
}
