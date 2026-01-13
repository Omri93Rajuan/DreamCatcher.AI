import request from "supertest";
import { createTestApp } from "../support/app";

describe("router", () => {
  it("returns healthz ok", async () => {
    const app = createTestApp();
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});



