import { Request, Response } from "express";
import * as userService from "../services/users.service";
import { handleError } from "../utils/ErrorHandle";
import { UserRole } from "../types/users.interface";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole.User;
  };
}

export const getAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.role) {
      handleError(res, 403, "Only admins can view all users");
      return;
    }
    const users = await userService.getAllUsers();
    res.json(users);
  } catch {
    handleError(res, 404, "Failed to fetch users");
  }
};

export const getByCall = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.role) {
      handleError(res, 403, "Only admins can view this resource");
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await userService.getUsersByCall(page, limit);
    res.json(result);
  } catch {
    handleError(res, 500, "Failed to fetch paginated users");
  }
};
export const getByIdPublic = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    _id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    avatar: user.image,
    email: user.email,
  });
};

export const getById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      handleError(res, 401, "Unauthorized");
      return;
    }
    if (!req.user.role && req.user.id !== req.params.id) {
      handleError(res, 403, "You can only view your own account");
      return;
    }
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch {
    handleError(res, 404, "User not found");
  }
};

export const create = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await userService.addUser(req.body);
    res.status(201).json(user);
  } catch {
    handleError(res, 400, "Error creating user");
  }
};

export const update = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      handleError(res, 401, "Unauthorized");
      return;
    }
    if (!req.user.role && req.user.id !== req.params.id) {
      handleError(res, 403, "You can only update your own account");
      return;
    }
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch {
    handleError(res, 400, "Error updating user");
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      handleError(res, 401, "Unauthorized");
      return;
    }
    if (!req.user.role && req.user.id !== req.params.id) {
      handleError(res, 403, "You can only delete your own account");
      return;
    }
    const result = await userService.deleteUser(req.params.id);
    res.json(result);
  } catch {
    handleError(res, 404, "Error deleting user");
  }
};
