import jwt from "jsonwebtoken";
import request from "supertest";
import { Dream } from "../../src/models/dream";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { setLLMProvider } from "../../src/llm";

describe("dream routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(async () => {
    await clearTestDb();
    setLLMProvider(null as any);
  });

  const signToken = (userId: string) =>
    jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET as string);

  it("creates a dream with categories filtered", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    const app = createTestApp();
    const res = await request(app)
      .post("/api/dreams")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({
        userInput: "dream",
        aiResponse: "interpretation",
        title: "t",
        categories: ["travel", "invalid"],
        categoryScores: { travel: 0.8 },
      });
    expect(res.status).toBe(201);
    const stored = await Dream.findById(res.body.dream._id).lean();
    expect(stored?.categories).toEqual(["travel"]);
    expect((stored as any)?.categoryScores?.travel).toBe(0.8);
  });

  it("lists only shared dreams for anonymous viewer", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    await Dream.create({
      userId: user._id,
      title: "private",
      userInput: "x",
      aiResponse: "y",
      isShared: false,
    });
    await Dream.create({
      userId: user._id,
      title: "shared",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const app = createTestApp();
    const res = await request(app).get("/api/dreams");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it("interprets with LLM provider and saves dream", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    setLLMProvider({
      interpretDream: async () => ({
        title: "t",
        interpretation: "i",
        categories: ["travel"],
        categoryScores: { travel: 0.5 },
      }),
    } as any);
    const app = createTestApp();
    const res = await request(app)
      .post("/api/dreams/interpret")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({ text: "hello", isShared: true });
    expect(res.status).toBe(201);
    expect(res.body.dream.isShared).toBe(true);
  });
});



