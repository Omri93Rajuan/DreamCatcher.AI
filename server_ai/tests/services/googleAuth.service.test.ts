import User from "../../src/models/user";
import { connectTestDb, clearTestDb, closeTestDb } from "../support/db";
import { upsertGoogleUser } from "../../src/services/googleAuth.service";

describe("googleAuth.service (db)", () => {
  beforeAll(connectTestDb);
  afterAll(closeTestDb);
  afterEach(clearTestDb);

  const profile = {
    sub: "google-123",
    email: "ab@example.com",
    given_name: "Anna",
    family_name: "Bell",
  };

  it("creates a new user when allowed", async () => {
    const user = await upsertGoogleUser(profile, {
      allowCreate: true,
      requireTerms: true,
      termsVersion: "v1",
    });
    expect(user.email).toBe("ab@example.com");
    expect(user.googleId).toBe("google-123");
    expect(user.termsAccepted).toBe(true);
  });

  it("updates existing user by email", async () => {
    await User.create({
      firstName: "Anna",
      lastName: "Bell",
      email: "ab@example.com",
      password: "hashed",
      termsAccepted: false,
    });
    const user = await upsertGoogleUser(profile, {
      allowCreate: true,
      termsVersion: "v2",
    });
    expect(user.googleId).toBe("google-123");
    expect(user.termsAccepted).toBe(true);
  });
});



