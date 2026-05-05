import { validateGoogleRedirectUri } from "../../src/services/googleAuth.service";

describe("googleAuth redirect URI validation", () => {
  it("allows HTTPS redirect URIs in production", () => {
    expect(
      validateGoogleRedirectUri(
        "https://api.example.com/api/auth/google/callback",
        { production: true }
      )
    ).toBe("https://api.example.com/api/auth/google/callback");
  });

  it("allows localhost HTTP only outside production", () => {
    expect(
      validateGoogleRedirectUri(
        "http://localhost:1000/api/auth/google/callback",
        { production: false }
      )
    ).toBe("http://localhost:1000/api/auth/google/callback");
  });

  it("rejects HTTP redirect URIs outside localhost", () => {
    expect(() =>
      validateGoogleRedirectUri(
        "http://api.example.com/api/auth/google/callback",
        { production: true }
      )
    ).toThrow("HTTPS");
  });

  it("rejects localhost redirect URIs in production", () => {
    expect(() =>
      validateGoogleRedirectUri(
        "http://localhost:1000/api/auth/google/callback",
        { production: true }
      )
    ).toThrow("localhost");
  });

  it("rejects raw public IP redirect URIs", () => {
    expect(() =>
      validateGoogleRedirectUri(
        "https://203.0.113.10/api/auth/google/callback",
        { production: true }
      )
    ).toThrow("raw IP");
  });
});
