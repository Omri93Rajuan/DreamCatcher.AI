import { comparePassword, hashPassword } from "../../src/helpers/bcrypt";

describe("bcrypt helpers", () => {
  it("hashes and verifies a password", () => {
    const password = "test-password";
    const hashed = hashPassword(password);
    expect(hashed).not.toBe(password);
    expect(comparePassword(password, hashed)).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const hashed = hashPassword("secret");
    expect(comparePassword("wrong", hashed)).toBe(false);
  });
});



