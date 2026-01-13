import { Types } from "mongoose";
import { Dream } from "../../src/models/dream";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import {
  createDreamFromInterpretation,
  getDreams,
  getDreamStats,
  updateDream,
} from "../../src/services/dream.service";

jest.setTimeout(20000);

describe("dream.service (db)", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("creates a dream with default title", async () => {
    const userId = new Types.ObjectId().toString();
    const dream = await createDreamFromInterpretation(
      userId,
      "input",
      "interpretation"
    );
    expect(dream.title).toBe("Untitled dream");
    expect(dream.userId.toString()).toBe(userId);
  });

  it("filters dreams based on viewer access", async () => {
    const userA = new Types.ObjectId();
    const userB = new Types.ObjectId();
    await Dream.create({
      userId: userA,
      title: "private",
      userInput: "x",
      aiResponse: "y",
      isShared: false,
    });
    await Dream.create({
      userId: userA,
      title: "shared",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    await Dream.create({
      userId: userB,
      title: "other",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });

    const resViewer = await getDreams({
      viewerId: userB.toString(),
      userId: userA.toString(),
    });
    expect(resViewer.total).toBe(1);
    expect(resViewer.dreams[0].title).toBe("shared");

    const resOwner = await getDreams({
      viewerId: userA.toString(),
      userId: userA.toString(),
    });
    expect(resOwner.total).toBe(2);
  });

  it("updates share status and sharedAt", async () => {
    const dream = await Dream.create({
      userId: new Types.ObjectId(),
      title: "t",
      userInput: "x",
      aiResponse: "y",
      isShared: false,
    });
    const updated = await updateDream(dream._id.toString(), {
      isShared: true,
    });
    expect(updated?.isShared).toBe(true);
    expect(updated?.sharedAt).not.toBeNull();
  });

  it("computes dream stats", async () => {
    const userA = new Types.ObjectId();
    const userB = new Types.ObjectId();
    await Dream.create({
      userId: userA,
      title: "a",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    await Dream.create({
      userId: userA,
      title: "b",
      userInput: "x",
      aiResponse: "y",
      isShared: false,
    });
    await Dream.create({
      userId: userB,
      title: "c",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const stats = await getDreamStats({});
    expect(stats.totalAll).toBe(3);
    expect(stats.totalPublic).toBe(2);
    expect(stats.uniqueUsers).toBe(2);
  });
});



