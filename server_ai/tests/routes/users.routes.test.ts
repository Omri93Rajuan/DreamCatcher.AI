import jwt from "jsonwebtoken";
import request from "supertest";
import User from "../../src/models/user";
import { createTestApp } from "../support/app";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { hashPassword } from "../../src/helpers/bcrypt";

describe("users routes", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  const signToken = (userId: string) =>
    jwt.sign({ _id: userId }, process.env.JWT_ACCESS_SECRET as string);

  it("rejects non-admin list", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      role: "user",
    });
    const app = createTestApp();
    const res = await request(app)
      .get("/api/users")
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`]);
    expect(res.status).toBe(403);
  });

  it("allows admin to create and fetch users", async () => {
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: hashPassword("secret123"),
      role: "admin",
    });
    const app = createTestApp();
    const res = await request(app)
      .post("/api/users")
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`])
      .send({
        firstName: "Alex",
        lastName: "Baker",
        email: "ab@example.com",
        password: "secret123",
      });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("ab@example.com");

    const list = await request(app)
      .get("/api/users")
      .set("Cookie", [`auth_token=${signToken(admin._id.toString())}`]);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(2);
  });

  it("allows a user to fetch and update self", async () => {
    const user = await User.create({
      firstName: "Alex",
      lastName: "Baker",
      email: "ab@example.com",
      password: hashPassword("secret123"),
      role: "user",
    });
    const app = createTestApp();
    const res = await request(app)
      .get(`/api/users/${user._id}`)
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`]);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("ab@example.com");

    const updated = await request(app)
      .patch(`/api/users/${user._id}`)
      .set("Cookie", [`auth_token=${signToken(user._id.toString())}`])
      .send({ firstName: "Alexa" });
    expect(updated.status).toBe(200);
    expect(updated.body.firstName).toBe("Alexa");
  });
});



