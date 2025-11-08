import { hashPassword } from "../helpers/bcrypt";
import User from "../models/user";
import { handleBadRequest } from "../utils/ErrorHandle";
import { IUser, UserRole, SubscriptionType, PublicUser, CreateUserDTO, UpdateUserDTO, } from "../types/users.interface";
const toPublic = (u: any): PublicUser => (u?.toJSON?.() ?? u) as PublicUser;
export const getAllUsers = async (): Promise<PublicUser[]> => {
    try {
        const users = await User.find().select("-password");
        return users.map(toPublic);
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
export const getUsersByCall = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const users = await User.find().select("-password").skip(skip).limit(limit);
        const totalUsers = await User.countDocuments();
        return {
            users: users.map(toPublic),
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            totalUsers,
        };
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
export const getUserById = async (userId: string): Promise<PublicUser | null> => {
    try {
        const user = await User.findById(userId).select("-password");
        return user ? toPublic(user) : null;
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
export const addUser = async (userData: CreateUserDTO): Promise<PublicUser> => {
    try {
        if (!userData.email || !userData.password) {
            throw new Error("Missing required fields");
        }
        const newUser = new User({
            ...userData,
            role: UserRole.User,
            subscription: SubscriptionType.Free,
        });
        newUser.password = hashPassword(userData.password);
        await newUser.save();
        const saved = await User.findById(newUser._id).select("-password");
        return toPublic(saved);
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
export const updateUser = async (userId: string, updateData: UpdateUserDTO): Promise<PublicUser> => {
    try {
        if ((updateData as any).password) {
            throw new Error("Password cannot be updated through this endpoint");
        }
        delete (updateData as any).role;
        delete (updateData as any).subscription;
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error("User not found");
        }
        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...updateData,
            password: existingUser.password,
        }, { new: true, runValidators: true }).select("-password");
        return toPublic(updatedUser);
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
export const adminUpdateUser = async (userId: string, updateData: Partial<IUser>): Promise<PublicUser> => {
    try {
        if (updateData.password) {
            throw new Error("Password cannot be updated through this endpoint");
        }
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error("User not found");
        }
        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...updateData,
            password: existingUser.password,
        }, { new: true, runValidators: true }).select("-password");
        return toPublic(updatedUser);
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
export const deleteUser = async (userId: string) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser)
            throw new Error("User not found");
        return { message: "User deleted successfully" };
    }
    catch (error: any) {
        return handleBadRequest("MongoDB", error);
    }
};
