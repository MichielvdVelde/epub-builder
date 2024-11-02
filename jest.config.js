export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "coverage", outputName: "junit.xml" }],
  ],
};
