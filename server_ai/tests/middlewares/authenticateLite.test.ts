import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import authenticateLite from "../../src/middlewares/authenticateLite";

describe("authenticateLite middleware", () => {
  it("attaches user when token is valid", async () => {
    const token = jwt.sign(
      { _id: "u1", role: "admin" },
      process.env.JWT_ACCESS_SECRET as string
    );
    const app = express();
    app.use(cookieParser());
    app.get("/t", authenticateLite, (req, res) =>
      res.json({ user: (req as any).user })
    );
    const res = await request(app)
      .get("/t")
      .set("Cookie", [`auth_token=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body.user.isAdmin).toBe(true);
  });

  it("ignores invalid token", async () => {
    const app = express();
    app.use(cookieParser());
    app.get("/t", authenticateLite, (req, res) =>
      res.json({ user: (req as any).user ?? null })
    );
    const res = await request(app)
      .get("/t")
      .set("Cookie", ["auth_token=bad"]);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });
});



