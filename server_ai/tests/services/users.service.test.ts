import { Types } from "mongoose";
import User from "../../src/models/user";
import {
  addUser,
  adminUpdateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUsersByCall,
  updateUser,
} from "../../src/services/users.service";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { hashPassword } from "../../src/helpers/bcrypt";

jest.mock("../../src/services/upload.service", () => ({
  deleteUserAvatar: jest.fn().mockResolvedValue(undefined),
}));

const seedUser = async (overrides: Partial<any> = {}) => {
  return User.create({
    firstName: "Test",
    lastName: "User",
    email: `u${Math.random().toString(16).slice(2)}@example.com`,
    password: hashPassword("secret123"),
    image: null,
    ...overrides,
  });
};

describe("users.service (db)", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("adds a user and returns public fields", async () => {
    const created = await addUser({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    expect(created.email).toBe("ab@example.com");
    expect((created as any).password).toBeUndefined();

    const stored = await User.findOne({ email: "ab@example.com" }).select(
      "+password"
    );
    expect(stored).not.toBeNull();
    expect(stored?.password).not.toBe("secret123");
  });

  it("returns all users without passwords", async () => {
    await seedUser({ email: "u1@example.com" });
    await seedUser({ email: "u2@example.com" });
    const users = await getAllUsers();
    expect(users.length).toBe(2);
    expect(users[0]).not.toHaveProperty("password");
  });

  it("paginates users", async () => {
    await seedUser({ email: "u1@example.com" });
    await seedUser({ email: "u2@example.com" });
    await seedUser({ email: "u3@example.com" });
    const res = await getUsersByCall(1, 2);
    expect(res.users.length).toBe(2);
    expect(res.totalUsers).toBe(3);
    expect(res.totalPages).toBe(2);
  });

  it("returns null for missing user id", async () => {
    const res = await getUserById(new Types.ObjectId().toString());
    expect(res).toBeNull();
  });

  it("updates a user and rejects password updates", async () => {
    const u = await seedUser({ image: "old.png" });
    const updated = await updateUser(u._id.toString(), { firstName: "New" });
    expect(updated.firstName).toBe("New");

    await expect(
      updateUser(u._id.toString(), { password: "x" } as any)
    ).rejects.toThrow("Password cannot be updated through this endpoint");
  });

  it("allows admin update and delete", async () => {
    const u = await seedUser({ image: "old.png" });
    const updated = await adminUpdateUser(u._id.toString(), {
      lastName: "Admin",
    });
    expect(updated.lastName).toBe("Admin");

    const res = await deleteUser(u._id.toString());
    expect(res.message).toBe("User deleted successfully");
  });
});



