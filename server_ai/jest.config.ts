import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/src/test/setup.ts"],
  extensionsToTreatAsEsm: [],
  clearMocks: true,
  moduleNameMapper: {
    "^node-fetch$": "<rootDir>/src/test/mocks/node-fetch.ts",
  },
};

export default config;
