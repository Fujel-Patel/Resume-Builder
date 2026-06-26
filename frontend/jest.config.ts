import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/src/lib/jest-setup.ts"],
  testEnvironment: "jsdom",
}

export default createJestConfig(config)
