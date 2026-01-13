import { mapMongoError } from "../../src/helpers/mapMongoError";

describe("mapMongoError", () => {
  it("returns a duplicate key error message with the field name", () => {
    const err = { code: 11000, keyValue: { email: "a@b.com" } };
    expect(mapMongoError(err)).toBe("email already exists");
  });

  it("aggregates validation error messages", () => {
    const err = {
      name: "ValidationError",
      errors: {
        email: { message: "Email required" },
        password: { message: "Password required" },
      },
    };
    expect(mapMongoError(err)).toBe("Email required, Password required");
  });

  it("handles cast errors with the field path", () => {
    const err = { name: "CastError", path: "userId" };
    expect(mapMongoError(err)).toBe('Invalid value for field "userId"');
  });

  it("falls back to error.message when present", () => {
    const err = { message: "Boom" };
    expect(mapMongoError(err)).toBe("Boom");
  });

  it("uses a generic message when nothing matches", () => {
    expect(mapMongoError({})).toBe("Unexpected error occurred");
  });
});



