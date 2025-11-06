import type { AuthRequest } from "../types/auth.interface";
export const getAuth = (req: AuthRequest) => {
    const raw = req.user?._id;
    const clean = typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : null;
    return {
        userId: clean,
        isAdmin: !!req.user?.isAdmin,
    };
};
