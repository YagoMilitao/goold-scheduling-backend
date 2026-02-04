const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.spec.ts"],
  setupFiles: ["<rootDir>/test/setupEnv.ts"],
  setupFilesAfterEnv: ["<rootDir>/test/setupTestDb.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  transform: {
    ...tsJestTransformCfg,
  },
};