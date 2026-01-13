import crypto from "crypto";
import User from "../../src/models/user";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import {
  canRequestPasswordReset,
  createResetToken,
  stampPasswordReset,
  verifyAndConsumeResetToken,
} from "../../src/services/password.service";
import { hashPassword } from "../../src/helpers/bcrypt";

describe("password.service (db)", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("creates a reset token and stores its hash", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    const { token, expires } = await createResetToken(user._id.toString());
    expect(token).toHaveLength(64);
    expect(expires).toBeInstanceOf(Date);

    const stored = await User.findById(user._id).select(
      "+resetPasswordTokenHash"
    );
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    expect(stored?.resetPasswordTokenHash).toBe(hash);
  });

  it("verifies and consumes a reset token", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    const { token } = await createResetToken(user._id.toString());
    const res = await verifyAndConsumeResetToken(token);
    expect(res).not.toBeNull();

    const stored = await User.findById(user._id).select(
      "+resetPasswordTokenHash"
    );
    expect(stored?.resetPasswordTokenHash).toBeNull();
  });

  it("stamps and blocks frequent reset requests", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    await stampPasswordReset(user._id.toString());
    const res = await canRequestPasswordReset(user._id.toString());
    expect(res.allowed).toBe(false);
  });
});



