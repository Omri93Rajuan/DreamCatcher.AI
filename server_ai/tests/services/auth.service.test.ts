import User from "../../src/models/user";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { hashPassword } from "../../src/helpers/bcrypt";
import { getMe, login, register } from "../../src/services/auth.service";

describe("auth.service (db)", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("registers a user and hashes the password", async () => {
    const user = await register({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
      termsAgreed: true,
      termsVersion: "v1",
    });
    expect(user.email).toBe("ab@example.com");

    const stored = await User.findOne({ email: "ab@example.com" }).select(
      "+password"
    );
    expect(stored?.password).not.toBe("secret123");
  });

  it("rejects login with wrong password", async () => {
    await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    await expect(
      login({ email: "ab@example.com", password: "wrong" })
    ).rejects.toThrow("Incorrect password or Email");
  });

  it("rejects login when password is not hashed", async () => {
    await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "plain-text",
    });
    await expect(
      login({ email: "ab@example.com", password: "plain-text" })
    ).rejects.toThrow("User password is not hashed in DB");
  });

  it("returns public user data on login", async () => {
    const u = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    const res = await login({ email: "ab@example.com", password: "secret123" });
    expect(res._id).toBe(String(u._id));
    expect((res as any).password).toBeUndefined();
  });

  it("returns me and derives name", async () => {
    const u = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    const me = await getMe(String(u._id));
    expect(me.name).toBe("Alex Baker");
  });
});



