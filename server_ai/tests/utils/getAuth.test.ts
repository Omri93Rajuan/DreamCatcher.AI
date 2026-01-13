import type { AuthRequest } from "../../src/types/auth.interface";
import { getAuth } from "../../src/utils/getAuth";

describe("getAuth", () => {
  it("trims and returns the user id", () => {
    const req = { user: { _id: " 123 ", isAdmin: true } } as AuthRequest;
    expect(getAuth(req)).toEqual({ userId: "123", isAdmin: true });
  });

  it("returns null when the user id is empty", () => {
    const req = { user: { _id: "   ", isAdmin: false } } as AuthRequest;
    expect(getAuth(req)).toEqual({ userId: null, isAdmin: false });
  });

  it("defaults to non-admin when missing", () => {
    const req = { user: { _id: "abc" } } as AuthRequest;
    expect(getAuth(req)).toEqual({ userId: "abc", isAdmin: false });
  });
});



