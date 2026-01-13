process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.APP_URL = process.env.APP_URL || "http://localhost:5173";
process.env.API_URL = process.env.API_URL || "http://localhost:1000";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "test-access-secret";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "test-refresh-secret";
process.env.REFRESH_SECRET =
  process.env.REFRESH_SECRET || "test-refresh-secret";
process.env.GOOGLE_STATE_SECRET =
  process.env.GOOGLE_STATE_SECRET || "google-test-secret";
process.env.TERMS_VERSION = process.env.TERMS_VERSION || "test-terms";
process.env.OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY || "test-openrouter-key";

jest.setTimeout(20000);



