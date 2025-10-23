import { CookieOptions, Response } from "express";
import { comparePassword } from "../helpers/bcrypt";
import { generateAuthToken } from "../middlewares/jwt";
import Users from "../models/user";
import { handleBadRequest } from "../utils/ErrorHandle";

const cookieConfig: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};
interface userDTO {
  email: string;
  password: string;
}

const login = async (user: userDTO, res: Response) => {
  try {
    if (!user?.email || !user?.password) {
      throw new Error("Missing required fields");
    }

    const foundUser = await Users.findOne({ email: user.email });
    if (!foundUser) {
      throw new Error("Could not find this user in the database");
    }

    const isPasswordCorrect = await comparePassword(
      user.password,
      foundUser.password
    );
    if (!isPasswordCorrect) {
      throw new Error("Incorrect password or Email");
    }

    const { _id, role } = foundUser;
    let token = generateAuthToken({ _id, isAdmin: role === "admin" });

    if (!cookieConfig) {
      throw new Error("Cookie configuration is missing");
    }

    res.cookie("auth_token", token, cookieConfig);
    return { foundUser, token };
  } catch (error: any) {
    error.status = 404;
    return handleBadRequest("MongoDB", error);
  }
};

const logout = (res: Response) => {
  try {
    res.clearCookie("auth_token", cookieConfig);
    console.log("User logged out and cookie cleared");
  } catch (error: any) {
    error.status = 500;
    return handleBadRequest("Logout Error", error);
  }
};

const getMe = async (userId: string) => {
  try {
    return await Users.findById(userId)
      .populate({
        path: "orders",
        populate: { path: "products.product" }, // מוצרים בתוך ההזמנות
      })
      .lean();
  } catch (error: any) {
    return handleBadRequest("MongoDB", error);
  }
};

export { login, logout, getMe };
