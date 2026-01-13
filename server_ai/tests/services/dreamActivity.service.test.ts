import { Types } from "mongoose";
import { Dream } from "../../src/models/dream";
import { DreamActivity } from "../../src/models/dreamActivity";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { getPopular, getReactions, recordActivity } from "../../src/services/dreamActivity.service";

jest.setTimeout(20000);

describe("dreamActivity.service (db)", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("records unique views per day", async () => {
    const dream = await Dream.create({
      userId: new Types.ObjectId(),
      title: "t",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const first = await recordActivity({
      dreamId: dream._id.toString(),
      ip: "1.2.3.4",
      type: "view",
    });
    const second = await recordActivity({
      dreamId: dream._id.toString(),
      ip: "1.2.3.4",
      type: "view",
    });
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);

    const count = await DreamActivity.countDocuments({
      dreamId: dream._id,
      type: "view",
    });
    expect(count).toBe(1);
  });

  it("toggles likes and updates counts", async () => {
    const dream = await Dream.create({
      userId: new Types.ObjectId(),
      title: "t",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const userId = new Types.ObjectId().toString();
    const first = await recordActivity({
      dreamId: dream._id.toString(),
      userId,
      type: "like",
    });
    expect(first.ok).toBe(true);

    const second = await recordActivity({
      dreamId: dream._id.toString(),
      userId,
      type: "like",
    });
    expect(second.action).toBe("removed");

    const count = await DreamActivity.countDocuments({
      dreamId: dream._id,
      type: "like",
    });
    expect(count).toBe(0);
  });

  it("returns reactions and myReaction", async () => {
    const dream = await Dream.create({
      userId: new Types.ObjectId(),
      title: "t",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const userId = new Types.ObjectId().toString();
    await recordActivity({
      dreamId: dream._id.toString(),
      userId,
      type: "like",
    });
    await recordActivity({
      dreamId: dream._id.toString(),
      ip: "1.1.1.1",
      type: "view",
    });
    const res = await getReactions(dream._id.toString(), userId);
    expect(res.likes).toBe(1);
    expect(res.viewsTotal).toBe(1);
    expect(res.myReaction).toBe("like");
  });

  it("returns popular shared dreams only", async () => {
    const userId = new Types.ObjectId();
    const shared = await Dream.create({
      userId,
      title: "shared",
      userInput: "x",
      aiResponse: "y",
      isShared: true,
      sharedAt: new Date(),
    });
    const privateDream = await Dream.create({
      userId,
      title: "private",
      userInput: "x",
      aiResponse: "y",
      isShared: false,
    });
    await recordActivity({
      dreamId: shared._id.toString(),
      ip: "2.2.2.2",
      type: "view",
    });
    await recordActivity({
      dreamId: privateDream._id.toString(),
      ip: "3.3.3.3",
      type: "view",
    });

    const res = await getPopular(7, 10, false);
    expect(res.length).toBe(1);
    expect(res[0].dreamId).toBe(shared._id.toString());
  });
});



