import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/tests/support/setup.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { tsconfig: { types: ["node", "jest"] } },
    ],
  },
  extensionsToTreatAsEsm: [],
  clearMocks: true,
  moduleNameMapper: {
    "^node-fetch$": "<rootDir>/tests/mocks/node-fetch.ts",
  },
};

export default config;
