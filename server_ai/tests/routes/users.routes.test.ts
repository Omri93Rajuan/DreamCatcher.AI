import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import request from "supertest";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { hashPassword } from "../../src/helpers/bcrypt";
import { Dream } from "../../src/models/dream";
import { DreamActivity } from "../../src/models/dreamActivity";
import { SiteVisit } from "../../src/models/siteVisit";
import PasswordResetQuota from "../../src/models/passwordResetToken";

describe("users routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  const signToken = (userId: string) =>
    jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET as string);

  it("rejects non-admin list", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      role: "user",
    });
    const app = createTestApp();
    const res = await request(app)
      .get("/api/users")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`]);
    expect(res.status).toBe(403);
  });

  it("allows admin to create and fetch users", async () => {
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: hashPassword("secret123"),
      role: "admin",
    });
    const app = createTestApp();
    const res = await request(app)
      .post("/api/users")
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`])
      .send({
        firstName: "Alex",
        lastName: "Baker",
        email: "ab@example.com",
        password: "secret123",
      });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("ab@example.com");

    const list = await request(app)
      .get("/api/users")
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`]);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(2);
  });

  it("allows a user to fetch and update self", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      role: "user",
    });
    const app = createTestApp();
    const res = await request(app)
      .get(`/api/users/${user._id}`)
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("ab@example.com");

    const updated = await request(app)
      .patch(`/api/users/${user._id}`)
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({ firstName: "Alexa" });
    expect(updated.status).toBe(200);
    expect(updated.body.firstName).toBe("Alexa");
  });

  it("deletes the account and all associated database data", async () => {
    const user = await User.create({
      firstName: "Delete",
      lastName: "Me",
      email: "delete@example.com",
      password: hashPassword("secret123"),
      role: "user",
      image: "/avatars/avatar-1.webp",
    });
    const other = await User.create({
      firstName: "Other",
      lastName: "User",
      email: "other@example.com",
      password: hashPassword("secret123"),
    });
    const dream = await Dream.create({
      userId: user._id,
      title: "shared secret",
      userInput: "private content",
      aiResponse: "interpretation",
      isShared: true,
      sharedAt: new Date(),
    });
    await DreamActivity.create({
      dreamId: dream._id,
      userId: other._id,
      type: "like",
      dayBucket: "2026-08-31",
    });
    await DreamActivity.create({
      dreamId: new Types.ObjectId(),
      userId: user._id,
      type: "like",
      dayBucket: "2026-08-31",
    });
    await SiteVisit.create({
      userId: user._id,
      sessionIdHash: "session-delete",
      dayBucket: "2026-08-31",
    });
    await PasswordResetQuota.create({ userId: user._id });

    const app = createTestApp();
    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`]);
    expect(res.status).toBe(200);
    expect(await User.findById(user._id)).toBeNull();
    expect(await Dream.countDocuments({ userId: user._id })).toBe(0);
    expect(
      await DreamActivity.countDocuments({
        $or: [{ userId: user._id }, { dreamId: dream._id }],
      })
    ).toBe(0);
    expect(await SiteVisit.countDocuments({ userId: user._id })).toBe(0);
    expect(await PasswordResetQuota.countDocuments({ userId: user._id })).toBe(0);

    const publicDream = await request(app).get(`/api/dreams/${dream._id}`);
    expect(publicDream.status).toBe(404);
  });
});

