import {
  googleAuthUrlSchema,
  googleCallbackSchema,
  googleCompleteSchema,
} from "../../src/validation/auth.zod";

describe("googleAuthUrlSchema", () => {
  it("requires terms acceptance and version for signup", () => {
    const result = googleAuthUrlSchema.safeParse({
      query: { mode: "signup", termsVersion: "v1" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("query.termsAccepted");
    }
  });

  it("passes for valid signup params", () => {
    const result = googleAuthUrlSchema.safeParse({
      query: {
        mode: "signup",
        termsAccepted: "true",
        termsVersion: "v1",
      },
    });
    expect(result.success).toBe(true);
  });

  it("allows login without terms fields", () => {
    const result = googleAuthUrlSchema.safeParse({
      query: { mode: "login" },
    });
    expect(result.success).toBe(true);
  });

  it("allows Google callback errors without an authorization code", () => {
    const result = googleCallbackSchema.safeParse({
      query: {
        error: "access_denied",
        error_description: "The user denied the request",
      },
    });
    expect(result.success).toBe(true);
  });

  it("requires code and state for successful Google callbacks", () => {
    const result = googleCallbackSchema.safeParse({
      query: { state: "state-token" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("query.code");
    }
  });

  it("allows client-side Google callback completion with code and state", () => {
    const result = googleCompleteSchema.safeParse({
      body: {
        code: "auth-code",
        state: "state-token",
      },
    });
    expect(result.success).toBe(true);
  });

  it("requires state for client-side Google callback completion", () => {
    const result = googleCompleteSchema.safeParse({
      body: { code: "auth-code" },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join("."));
      expect(paths).toContain("body.state");
    }
  });
});



