import type { RequestHandler } from "express";
import {
  deleteAdminDream,
  getAdminOverview,
  listAdminUsers,
  listAdminDreams,
  updateAdminUserRole,
} from "../services/admin.service";
import { UserRole } from "../types/users.interface";

export const getOverview: RequestHandler = async (req, res): Promise<void> => {
  try {
    const windowDays =
      req.query.windowDays !== undefined
        ? Number(req.query.windowDays)
        : undefined;
    const overview = await getAdminOverview(windowDays);
    res.json({ success: true, ...overview });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Admin] overview failed", err?.message || err);
    }
    res.status(500).json({ success: false, error: "admin_overview_failed" });
  }
};

export const getDreams: RequestHandler = async (req, res): Promise<void> => {
  try {
    const result = await listAdminDreams({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      isShared:
        req.query.isShared === undefined
          ? undefined
          : req.query.isShared === "true" || req.query.isShared === "1",
      sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
      order: req.query.order === "asc" ? "asc" : "desc",
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Admin] dreams list failed", err?.message || err);
    }
    res.status(500).json({ success: false, error: "admin_dreams_failed" });
  }
};

export const removeDream: RequestHandler = async (req, res): Promise<void> => {
  try {
    const deleted = await deleteAdminDream(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "dream_not_found" });
      return;
    }
    res.json({ success: true, message: "Dream deleted successfully" });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Admin] delete dream failed", err?.message || err);
    }
    res.status(500).json({ success: false, error: "admin_delete_failed" });
  }
};

export const getUsers: RequestHandler = async (req, res): Promise<void> => {
  try {
    const role =
      req.query.role === UserRole.Admin
        ? UserRole.Admin
        : req.query.role === UserRole.User
        ? UserRole.User
        : undefined;
    const result = await listAdminUsers({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      role,
      sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
      order: req.query.order === "asc" ? "asc" : "desc",
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Admin] users list failed", err?.message || err);
    }
    res.status(500).json({ success: false, error: "admin_users_failed" });
  }
};

export const updateUserRole: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const updated = await updateAdminUserRole(req.params.id, req.body.role);
    if (!updated) {
      res.status(404).json({ success: false, error: "user_not_found" });
      return;
    }
    res.json({ success: true, user: updated });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Admin] update role failed", err?.message || err);
    }
    res.status(err?.status || 500).json({
      success: false,
      error: err?.code || "admin_role_update_failed",
      message: err?.message || "Could not update user role.",
    });
  }
};
