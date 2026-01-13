import { Readable } from "stream";
import request from "supertest";
import { createTestApp } from "../support/app";

jest.mock("../../src/services/image-proxy.service", () => ({
  getImageObject: jest.fn().mockResolvedValue({
    stream: Readable.from(["ok"]),
    contentType: "image/png",
    contentLength: 2,
    cacheSeconds: 3600,
  }),
}));

describe("images routes", () => {
  it("proxies images under allowed prefix", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/images/avatars/test.png");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("image/png");
  });

  it("blocks disallowed prefixes", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/images/private/test.png");
    expect(res.status).toBe(403);
  });
});



