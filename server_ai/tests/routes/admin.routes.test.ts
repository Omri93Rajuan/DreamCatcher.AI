import jwt from "jsonwebtoken";
import request from "supertest";
import { Dream } from "../../src/models/dream";
import { DreamActivity } from "../../src/models/dreamActivity";
import { SiteVisit } from "../../src/models/siteVisit";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { clearTestDb, closeTestDb, connectTestDb } from "../support/db";

describe("admin routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  const signToken = (userId: string) =>
    jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET as string);

  async function createUser(role: "admin" | "user", email: string) {
    return User.create({
      firstName: role === "admin" ? "Ada" : "Alex",
      lastName: "Tester",
      email,
      password: "secret123",
      role,
    });
  }

  it("blocks non-admin users from the admin overview", async () => {
    const user = await createUser("user", "user@example.com");
    const app = createTestApp();

    const res = await request(app)
      .get("/api/admin/overview")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`]);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("admin_required");
  });

  it("lets admins list private and shared dreams", async () => {
    const admin = await createUser("admin", "admin@example.com");
    const owner = await createUser("user", "owner@example.com");
    await Dream.create([
      {
        userId: owner._id,
        title: "private",
        userInput: "private text",
        aiResponse: "private interpretation",
        isShared: false,
      },
      {
        userId: owner._id,
        title: "shared",
        userInput: "shared text",
        aiResponse: "shared interpretation",
        isShared: true,
      },
    ]);

    const app = createTestApp();
    const res = await request(app)
      .get("/api/admin/dreams?limit=20")
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`]);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.dreams.map((dream: any) => dream.title).sort()).toEqual([
      "private",
      "shared",
    ]);
    expect(res.body.dreams[0].user.email).toBe("owner@example.com");
  });

  it("lets admins delete any dream and removes its activity rows", async () => {
    const admin = await createUser("admin", "admin@example.com");
    const owner = await createUser("user", "owner@example.com");
    const dream = await Dream.create({
      userId: owner._id,
      title: "target",
      userInput: "target text",
      aiResponse: "target interpretation",
      isShared: false,
    });
    await DreamActivity.create({
      dreamId: dream._id,
      userId: owner._id,
      type: "view",
      dayBucket: "2026-05-04",
    });

    const app = createTestApp();
    const res = await request(app)
      .delete(`/api/admin/dreams/${dream._id}`)
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`]);

    expect(res.status).toBe(200);
    expect(await Dream.findById(dream._id)).toBeNull();
    expect(await DreamActivity.countDocuments({ dreamId: dream._id })).toBe(0);
  });

  it("includes new users, dreams, and visits in admin overview", async () => {
    const admin = await createUser("admin", "admin@example.com");
    const owner = await createUser("user", "owner@example.com");
    await Dream.create({
      userId: owner._id,
      title: "fresh dream",
      userInput: "text",
      aiResponse: "interpretation",
      isShared: true,
      categories: ["travel"],
    });

    const app = createTestApp();
    const visit = await request(app)
      .post("/api/visits")
      .send({ sessionId: "session-12345", path: "/dreams" });
    expect(visit.status).toBe(201);

    const duplicate = await request(app)
      .post("/api/visits")
      .send({ sessionId: "session-12345", path: "/dreams" });
    expect(duplicate.status).toBe(200);
    expect(await SiteVisit.countDocuments()).toBe(1);

    const res = await request(app)
      .get("/api/admin/overview?windowDays=30")
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`]);

    expect(res.status).toBe(200);
    expect(res.body.totals.users).toBe(2);
    expect(res.body.totals.dreams).toBe(1);
    expect(res.body.totals.visits).toBe(1);
    expect(res.body.metrics.newUsers.current).toBe(2);
    expect(res.body.metrics.newDreams.current).toBe(1);
    expect(res.body.metrics.siteVisits.current).toBe(1);
    expect(res.body.topCategories).toEqual([
      expect.objectContaining({ category: "travel", count: 1 }),
    ]);
  });
});
