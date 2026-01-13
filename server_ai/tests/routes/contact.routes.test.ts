import request from "supertest";

process.env.CONTACT_FORM_TO = "team@example.com";

jest.mock("../../src/helpers/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
}));

const buildApp = () => {
  const express = require("express");
  const contactRoutes = require("../../src/routes/contact.routes").default;
  const app = express();
  app.use(express.json());
  app.use("/api/contact", contactRoutes);
  return app;
};

describe("contact routes", () => {
  it("submits contact form", async () => {
    const app = buildApp();
    const res = await request(app).post("/api/contact").send({
      name: "Alex",
      email: "ab@example.com",
      message: "hello world!!",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects honeypot", async () => {
    const app = buildApp();
    const res = await request(app).post("/api/contact").send({
      name: "Alex",
      email: "ab@example.com",
      message: "hello",
      website: "bot",
    });
    expect(res.status).toBe(400);
  });
});



