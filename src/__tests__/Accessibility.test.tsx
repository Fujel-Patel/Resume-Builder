// src/__tests__/Accessibility.test.tsx
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import Button from "@/components/ui/Button";

expect.extend(toHaveNoViolations);

describe("Accessibility checks", () => {
  it("Button component should have no violations", async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
