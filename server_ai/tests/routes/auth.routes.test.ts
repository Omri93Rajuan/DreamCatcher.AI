import jwt from "jsonwebtoken";
import request from "supertest";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { hashPassword } from "../../src/helpers/bcrypt";

jest.mock("../../src/helpers/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
}));

describe("auth routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("registers a user and sets auth cookies", async () => {
    const app = createTestApp();
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
      termsAgreed: true,
      termsVersion: "v1",
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("ab@example.com");
    const raw = res.headers["set-cookie"] || [];
    const setCookie = Array.isArray(raw) ? raw : [raw];
    expect(setCookie.join(";")).toContain("auth_token=");
    expect(setCookie.join(";")).toContain("refresh_token=");
  });

  it("logs in a user", async () => {
    await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
    });
    const app = createTestApp();
    const res = await request(app).post("/api/auth/login").send({
      email: "ab@example.com",
      password: "secret123",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("ab@example.com");
  });

  it("refreshes access token", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      role: "user",
    });
    const app = createTestApp();
    const rt = jwt.sign(
      { _id: user._id.toString(), role: "user" },
      process.env.JWT_REFRESH_SECRET as string
    );
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", [`refresh_token=${rt}`]);
    expect(res.status).toBe(200);
    const raw = res.headers["set-cookie"] || [];
    const setCookie = Array.isArray(raw) ? raw : [raw];
    expect(setCookie.join(";")).toContain("auth_token=");
  });

  it("verifies a token via header", async () => {
    const app = createTestApp();
    const token = jwt.sign(
      { _id: "u1", role: "user", email: "ab@example.com" },
      process.env.JWT_ACCESS_SECRET as string
    );
    const res = await request(app)
      .get("/api/auth/verify")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it("logs out and clears cookies", async () => {
    const app = createTestApp();
    const res = await request(app).post("/api/auth/logout").send({});
    expect(res.status).toBe(200);
    const raw = res.headers["set-cookie"] || [];
    const setCookie = Array.isArray(raw) ? raw : [raw];
    expect(setCookie.join(";")).toContain("auth_token=");
  });
});



