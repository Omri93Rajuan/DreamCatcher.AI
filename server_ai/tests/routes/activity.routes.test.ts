import request from "supertest";
import { Dream } from "../../src/models/dream";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";

describe("activity routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("records a view activity", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    const dream = await Dream.create({
      userId: user._id,
      title: "shared",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const app = createTestApp();
    const res = await request(app)
      .post(`/api/activity/${dream._id}`)
      .send({ type: "view" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("returns reactions", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    const dream = await Dream.create({
      userId: user._id,
      title: "shared",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const app = createTestApp();
    const res = await request(app).get(`/api/activity/${dream._id}/reactions`);
    expect(res.status).toBe(200);
    expect(res.body.likes).toBe(0);
  });
});



