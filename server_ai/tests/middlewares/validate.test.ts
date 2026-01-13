import express from "express";
import request from "supertest";
import { z } from "zod";
import { validate } from "../../src/middlewares/validate";

describe("validate middleware", () => {
  const schema = z.object({
    body: z.object({ name: z.string().min(2) }),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
  });

  it("rejects invalid payloads", async () => {
    const app = express();
    app.use(express.json());
    app.post("/t", validate(schema), (_req, res) => res.json({ ok: true }));
    const res = await request(app).post("/t").send({ name: "A" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("passes and coerces valid payloads", async () => {
    const app = express();
    app.use(express.json());
    app.post("/t", validate(schema), (req, res) =>
      res.json({ ok: true, name: req.body.name })
    );
    const res = await request(app).post("/t").send({ name: "Ab" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Ab");
  });
});



