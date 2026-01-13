import { googleAuthUrlSchema } from "../../src/validation/auth.zod";

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
});



