// src/__tests__/BuilderWizard.accessibility.test.tsx
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import BuilderWizard from "@/components/resume/BuilderWizard";

expect.extend(toHaveNoViolations);

describe("BuilderWizard accessibility", () => {
  it("should have no axe violations on initial render", async () => {
    const { container } = render(<BuilderWizard initialDraft={null} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
