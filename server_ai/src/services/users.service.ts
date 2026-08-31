import mongoose, { type ClientSession, Types } from "mongoose";
import { hashPassword } from "../helpers/bcrypt";
import User from "../models/user";
import { Dream } from "../models/dream";
import { DreamActivity } from "../models/dreamActivity";
import { SiteVisit } from "../models/siteVisit";
import PasswordResetQuota from "../models/passwordResetToken";
import {
  CreateUserDTO,
  IUser,
  PublicUser,
  SubscriptionType,
  UpdateUserDTO,
  UserRole,
} from "../types/users.interface";
import { handleBadRequest } from "../utils/ErrorHandle";
import {
  deleteUserAvatar,
  getAvatarKeyFromUrl,
  normalizeStoredImageUrl,
} from "./upload.service";
const toPublic = (u: any): PublicUser => (u?.toJSON?.() ?? u) as PublicUser;
export const getAllUsers = async (): Promise<PublicUser[]> => {
  try {
    const users = await User.find().select("-password");
    return users.map(toPublic);
  } catch (error: any) {
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
  } catch (error: any) {
    return handleBadRequest("MongoDB", error);
  }
};
export const getUserById = async (
  userId: string
): Promise<PublicUser | null> => {
  try {
    const user = await User.findById(userId).select("-password");
    return user ? toPublic(user) : null;
  } catch (error: any) {
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
      image: normalizeStoredImageUrl(userData.image),
      role: UserRole.User,
      subscription: SubscriptionType.Free,
    });
    newUser.password = hashPassword(userData.password);
    await newUser.save();
    const saved = await User.findById(newUser._id).select("-password");
    return toPublic(saved);
  } catch (error: any) {
    return handleBadRequest("MongoDB", error);
  }
};
export const updateUser = async (
  userId: string,
  updateData: UpdateUserDTO
): Promise<PublicUser> => {
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
    const previousImage = existingUser.image;
    const normalizedUpdateData = { ...updateData };
    if ("image" in normalizedUpdateData) {
      (normalizedUpdateData as any).image = normalizeStoredImageUrl(
        (normalizedUpdateData as any).image
      );
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...normalizedUpdateData,
        password: existingUser.password,
      },
      { new: true, runValidators: true }
    ).select("-password");

    const previousAvatarKey = getAvatarKeyFromUrl(previousImage);
    const nextAvatarKey = getAvatarKeyFromUrl((updatedUser as any)?.image);
    if (
      previousImage &&
      previousImage !== (updatedUser as any)?.image &&
      previousAvatarKey !== nextAvatarKey
    ) {
      await deleteUserAvatar(userId, previousImage);
    }

    return toPublic(updatedUser);
  } catch (error: any) {
    return handleBadRequest("MongoDB", error);
  }
};
export const adminUpdateUser = async (
  userId: string,
  updateData: Partial<IUser>
): Promise<PublicUser> => {
  try {
    if (updateData.password) {
      throw new Error("Password cannot be updated through this endpoint");
    }
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const previousImage = existingUser.image;
    const normalizedUpdateData = { ...updateData };
    if ("image" in normalizedUpdateData) {
      (normalizedUpdateData as any).image = normalizeStoredImageUrl(
        (normalizedUpdateData as any).image
      );
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...normalizedUpdateData,
        password: existingUser.password,
      },
      { new: true, runValidators: true }
    ).select("-password");

    const previousAvatarKey = getAvatarKeyFromUrl(previousImage);
    const nextAvatarKey = getAvatarKeyFromUrl((updatedUser as any)?.image);
    if (
      previousImage &&
      previousImage !== (updatedUser as any)?.image &&
      previousAvatarKey !== nextAvatarKey
    ) {
      await deleteUserAvatar(userId, previousImage);
    }

    return toPublic(updatedUser);
  } catch (error: any) {
    return handleBadRequest("MongoDB", error);
  }
};
export const deleteUser = async (userId: string) => {
  try {
    if (!Types.ObjectId.isValid(userId)) throw new Error("User not found");
    const existingUser = await User.findById(userId).select("_id image");
    if (!existingUser) throw new Error("User not found");

    // Object storage cannot join the MongoDB transaction. Delete it first and
    // abort the account deletion if cleanup fails so success is never overstated.
    await deleteUserAvatar(userId, (existingUser as any).image, { strict: true });

    try {
      await mongoose.connection.transaction(async (session) => {
        await deleteUserData(userId, session);
      });
    } catch (error: any) {
      if (!isTransactionUnsupported(error)) throw error;
      // Local/test standalone MongoDB does not support transactions. Keep the
      // user deletion last and unshare first so a partial failure is retryable
      // and can never leave a shared dream publicly visible.
      await deleteUserData(userId);
    }

    return { message: "User deleted successfully" };
  } catch (error: any) {
    return handleBadRequest("MongoDB", error);
  }
};

async function deleteUserData(userId: string, session?: ClientSession) {
  const ownerId = new Types.ObjectId(userId);
  const dreams = await Dream.find({ userId: ownerId })
    .select("_id")
    .session(session || null)
    .lean();
  const dreamIds = dreams.map((dream) => dream._id);
  const opts = session ? { session } : undefined;

  await Dream.updateMany(
    { userId: ownerId },
    { $set: { isShared: false, sharedAt: null } },
    opts
  );
  await DreamActivity.deleteMany(
    {
      $or: [
        { userId: ownerId },
        ...(dreamIds.length ? [{ dreamId: { $in: dreamIds } }] : []),
      ],
    },
    opts
  );
  await Dream.deleteMany({ userId: ownerId }, opts);
  await SiteVisit.deleteMany({ userId: ownerId }, opts);
  await PasswordResetQuota.deleteMany({ userId: ownerId }, opts);
  const deleted = await User.deleteOne({ _id: ownerId }, opts);
  if (deleted.deletedCount !== 1) throw new Error("User not found");
}

function isTransactionUnsupported(error: any) {
  const message = String(error?.message || "");
  return (
    error?.code === 20 ||
    message.includes("Transaction numbers are only allowed") ||
    message.includes("does not support transactions")
  );
}
