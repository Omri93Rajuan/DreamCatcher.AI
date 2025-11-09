import { buildGoogleAuthUrl, createGoogleStateToken, decodeGoogleStateToken, sanitizeNextPath, sanitizeRedirectUrl, defaultGoogleRedirect, normalizeGoogleAvatar, } from "./googleAuth.service";

describe("googleAuth.service helpers", () => {
    beforeAll(() => {
        process.env.GOOGLE_STATE_SECRET = "jest-google-secret";
    });
    it("sanitizes dangerous next paths", () => {
        expect(sanitizeNextPath("https://evil.com")).toBe("/");
        expect(sanitizeNextPath("//attack")).toBe("/");
        expect(sanitizeNextPath("/safe/path")).toBe("/safe/path");
    });
    it("sanitizes redirect urls to same origin", () => {
        const safe = sanitizeRedirectUrl("http://localhost:5173/auth/google/callback");
        expect(safe).toContain("/auth/google/callback");
        const unsafe = sanitizeRedirectUrl("https://attacker.com/hijack");
        expect(unsafe).toBe(defaultGoogleRedirect);
    });
    it("creates and decodes state payloads", () => {
        const token = createGoogleStateToken({
            redirectTo: "http://localhost:5173/auth/google/callback",
            next: "/account",
            mode: "signup",
            termsAccepted: true,
            termsVersion: "test-terms",
            termsLocale: "he-IL",
        });
        const decoded = decodeGoogleStateToken(token);
        expect(decoded.mode).toBe("signup");
        expect(decoded.next).toBe("/account");
        expect(decoded.termsAccepted).toBe(true);
        expect(decoded.termsVersion).toBe("test-terms");
        expect(decoded.termsLocale).toBe("he-IL");
    });
    it("builds Google auth URLs with state parameter", () => {
        const url = buildGoogleAuthUrl("client", "http://localhost:1000/api/auth/google/callback", "state-token");
        expect(url).toContain("client_id=client");
        expect(url).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A1000%2Fapi%2Fauth%2Fgoogle%2Fcallback");
        expect(url).toContain("state=state-token");
    });
    it("normalizes google avatars to higher resolution", () => {
        expect(normalizeGoogleAvatar("https://lh3.googleusercontent.com/a-/AOh14Gh=s96-c")?.includes("256")).toBe(true);
        expect(normalizeGoogleAvatar("https://example.com/avatar.png?sz=64")?.includes("sz=256")).toBe(true);
        expect(normalizeGoogleAvatar(undefined)).toBe(null);
    });
});
