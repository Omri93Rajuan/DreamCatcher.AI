import jwt from "jsonwebtoken";
import request from "supertest";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";

jest.mock("../../src/services/upload.service", () => ({
  createAvatarUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: "u",
    publicUrl: "p",
    proxyUrl: "x",
    expiresIn: 300,
    maxBytes: 1000,
    key: "avatars/u/1.png",
  }),
}));

describe("uploads routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  it("returns an upload URL for authenticated user", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: "secret123",
    });
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_ACCESS_SECRET as string
    );
    const app = createTestApp();
    const res = await request(app)
      .post("/api/uploads/avatar-url")
      .set("Cookie", [`auth_token=${token}`])
      .send({ contentType: "image/png", contentLength: 100 });
    expect(res.status).toBe(200);
    expect(res.body.uploadUrl).toBe("u");
  });
});



