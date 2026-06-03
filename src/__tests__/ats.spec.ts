// Unit tests for ATS scoring library
import { describe, it, expect } from "vitest";
import { scoreResume, defaultConfig } from "../lib/ats";

const sampleResume = {
  rawText: `John Doe\nContact: john@example.com\nExperience:\n- Software Engineer (3 years)\nSkills: JavaScript, TypeScript, React, Node.js, Prisma`,
  skills: ["javascript", "typescript", "react", "node.js", "prisma"],
};

const sampleJob = {
  rawText: `We are looking for a senior developer. Required skills: JavaScript, TypeScript, React, Node.js. Minimum 2 years experience. Education: Bachelor`,
  requiredSkills: ["javascript", "typescript", "react", "node.js"],
  preferredSkills: ["prisma", "graphql"],
  minYearsExperience: 2,
  educationLevel: "Bachelor",
};

describe("ATS scoring", () => {
  it("produces a score between 0 and 100", () => {
    const result = scoreResume(sampleResume, sampleJob);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("calculates keyword similarity > 0", () => {
    const result = scoreResume(sampleResume, sampleJob);
    expect(result.breakdown.keywordScore).toBeGreaterThan(0);
  });

  it("matches required skills fully", () => {
    const result = scoreResume(sampleResume, sampleJob);
    expect(result.breakdown.skillScore).toBeCloseTo(100, -1); // high skill match
  });

  it("calculates experience correctly", () => {
    const result = scoreResume(sampleResume, sampleJob);
    expect(result.breakdown.experienceScore).toBe(100); // 3 years >= 2 required
  });

  it("respects education hierarchy", () => {
    const result = scoreResume(sampleResume, sampleJob);
    expect(result.breakdown.educationScore).toBe(100); // bachelor level matched
  });
});
