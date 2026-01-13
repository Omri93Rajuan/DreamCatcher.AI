import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import User from "../../src/models/user";
import authenticate from "../../src/middlewares/authenticate";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { hashPassword } from "../../src/helpers/bcrypt";

describe("authenticate middleware", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("rejects missing token", async () => {
    const app = express();
    app.use(cookieParser());
    app.get("/t", authenticate, (_req, res) => res.json({ ok: true }));
    const res = await request(app).get("/t");
    expect(res.status).toBe(401);
  });

  it("injects user context for valid token", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      role: "admin",
    });
    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_ACCESS_SECRET as string
    );
    const app = express();
    app.use(cookieParser());
    app.get("/t", authenticate, (req, res) =>
      res.json({ user: (req as any).user })
    );
    const res = await request(app)
      .get("/t")
      .set("Cookie", [`auth_token=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.user.isAdmin).toBe(true);
  });

  it("rejects revoked tokens after password change", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      passwordChangedAt: new Date(),
    });
    const token = jwt.sign(
      { _id: user._id.toString(), iat: Math.floor(Date.now() / 1000) - 60 },
      process.env.JWT_ACCESS_SECRET as string
    );
    const app = express();
    app.use(cookieParser());
    app.get("/t", authenticate, (_req, res) => res.json({ ok: true }));
    const res = await request(app)
      .get("/t")
      .set("Cookie", [`auth_token=${token}`]);
    expect(res.status).toBe(401);
  });
});



