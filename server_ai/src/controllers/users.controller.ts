import { Response } from "express";
import * as userService from "../services/users.service";
import { handleError } from "../utils/ErrorHandle";
import { CreateUserDTO, UpdateUserDTO } from "../types/users.interface";
import { AuthRequest } from "../types/auth.interface";
const isAdmin = (req: AuthRequest) => !!req.user?.isAdmin;
const getUserId = (req: AuthRequest) => req.user?._id ?? "";
export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAdmin(req)) {
            handleError(res, 403, "Only admins can view all users");
            return;
        }
        const users = await userService.getAllUsers();
        res.json(users);
    }
    catch (e: any) {
        handleError(res, e?.status || 404, e?.message || "Failed to fetch users");
    }
};
export const getByCall = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAdmin(req)) {
            handleError(res, 403, "Only admins can view this resource");
            return;
        }
        const page = parseInt(String(req.query.page || 1), 10) || 1;
        const limit = parseInt(String(req.query.limit || 10), 10) || 10;
        const result = await userService.getUsersByCall(page, limit);
        res.json(result);
    }
    catch (e: any) {
        handleError(res, e?.status || 500, e?.message || "Failed to fetch paginated users");
    }
};
export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            handleError(res, 401, "Unauthorized");
            return;
        }
        if (!isAdmin(req) && getUserId(req) !== req.params.id) {
            handleError(res, 403, "You can only view your own account");
            return;
        }
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            handleError(res, 404, "User not found");
            return;
        }
        res.json(user);
    }
    catch (e: any) {
        handleError(res, e?.status || 404, e?.message || "User not found");
    }
};
export const create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!isAdmin(req)) {
            handleError(res, 403, "Only admins can create users");
            return;
        }
        const user = await userService.addUser(req.body as CreateUserDTO);
        res.status(201).json(user);
    }
    catch (e: any) {
        handleError(res, e?.status || 400, e?.message || "Error creating user");
    }
};
export const update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            handleError(res, 401, "Unauthorized");
            return;
        }
        if (!isAdmin(req) && getUserId(req) !== req.params.id) {
            handleError(res, 403, "You can only update your own account");
            return;
        }
        const updated = await userService.updateUser(req.params.id, req.body as UpdateUserDTO);
        res.json(updated);
    }
    catch (e: any) {
        handleError(res, e?.status || 400, e?.message || "Error updating user");
    }
};
export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            handleError(res, 401, "Unauthorized");
            return;
        }
        if (!isAdmin(req) && getUserId(req) !== req.params.id) {
            handleError(res, 403, "You can only delete your own account");
            return;
        }
        const result = await userService.deleteUser(req.params.id);
        res.json(result);
    }
    catch (e: any) {
        handleError(res, e?.status || 404, e?.message || "Error deleting user");
    }
};
