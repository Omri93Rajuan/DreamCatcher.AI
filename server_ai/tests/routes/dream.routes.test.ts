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

  it("creates a dream using only server-generated analysis", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    setLLMProvider({
      interpretDream: async () => ({
        title: "t",
        interpretation: "interpretation",
        categories: ["travel"],
        categoryScores: { travel: 0.8 },
        insights: ["notice the journey"],
        keySymbols: [{ symbol: "train", meaning: "movement" }],
        emotions: ["curiosity"],
      }),
    } as any);
    const app = createTestApp();
    const res = await request(app)
      .post("/api/dreams")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({
        userInput: "dream",
        title: "t",
        locale: "en",
      });
    expect(res.status).toBe(201);
    const stored = await Dream.findById(res.body.dream._id).lean();
    expect(stored?.categories).toEqual(["travel"]);
    expect((stored as any)?.categoryScores?.travel).toBe(0.8);
    expect(stored?.insights).toEqual(["notice the journey"]);
    expect(stored?.keySymbols).toEqual([
      expect.objectContaining({ symbol: "train", meaning: "movement" }),
    ]);
    expect(stored?.emotions).toEqual(["curiosity"]);
  });

  it("rejects client-supplied model and AI analysis fields", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    const app = createTestApp();
    const cookie = [`auth_token=${signToken(user._id.toString())}`];

    const interpret = await request(app)
      .post("/api/dreams/interpret")
      .set("Cookie", cookie)
      .send({ text: "hello", model: "arbitrary/expensive-model" });
    expect(interpret.status).toBe(400);

    const create = await request(app)
      .post("/api/dreams")
      .set("Cookie", cookie)
      .send({ userInput: "hello", aiResponse: "client supplied" });
    expect(create.status).toBe(400);
  });

  it("rejects oversized dream text and pagination limits", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    const app = createTestApp();
    const oversized = await request(app)
      .post("/api/dreams/interpret")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({ text: "x".repeat(10001), locale: "en" });
    expect(oversized.status).toBe(400);
    expect(oversized.body.issues[0].message).toContain("10000");

    const list = await request(app).get("/api/dreams?limit=51");
    expect(list.status).toBe(400);
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
    let receivedOptions: any;
    setLLMProvider({
      interpretDream: async (_text: string, options: any) => {
        receivedOptions = options;
        return ({
        title: "t",
        interpretation: "i",
        insights: ["focus"],
        keySymbols: [{ symbol: "door", meaning: "choice" }],
        emotions: ["hope"],
        categories: ["travel"],
        categoryScores: { travel: 0.5 },
        });
      },
    } as any);
    const app = createTestApp();
    const res = await request(app)
      .post("/api/dreams/interpret")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({ text: "hello", isShared: true, locale: "en" });
    expect(res.status).toBe(201);
    expect(res.body.dream.isShared).toBe(true);
    expect(res.body.dream.insights).toEqual(["focus"]);
    expect(res.body.dream.keySymbols).toEqual([
      expect.objectContaining({ symbol: "door", meaning: "choice" }),
    ]);
    expect(res.body.dream.emotions).toEqual(["hope"]);
    expect(receivedOptions).toEqual({ locale: "en" });
  });
});


