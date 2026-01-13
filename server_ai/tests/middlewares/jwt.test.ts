import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { generateAuthToken, verifyAdmin, verifyUser } from "../../src/middlewares/jwt";
import { UserRole } from "../../src/types/users.interface";

describe("jwt middleware", () => {
  const secret = process.env.JWT_ACCESS_SECRET as string;

  it("generates a token and verifies user", async () => {
    const token = generateAuthToken({ _id: "u1", role: UserRole.User });
    const app = express();
    app.use(cookieParser());
    app.get("/t", verifyUser, (req, res) =>
      res.json({ ok: true, user: (req as any).user })
    );
    const res = await request(app)
      .get("/t")
      .set("Cookie", [`auth_token=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("u1");
  });

  it("blocks non-admins in verifyAdmin", async () => {
    const token = jwt.sign({ id: "u1", role: "user", isAdmin: false }, secret);
    const app = express();
    app.use(cookieParser());
    app.get("/t", verifyAdmin, (_req, res) => res.json({ ok: true }));
    const res = await request(app)
      .get("/t")
      .set("Cookie", [`auth_token=${token}`]);
    expect(res.status).toBe(403);
  });
});



