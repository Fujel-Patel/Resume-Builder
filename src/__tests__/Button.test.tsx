// src/__tests__/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "@/components/ui/Button";

describe("Button component", () => {
  it("renders children and responds to click", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalled();
  });

  it("shows loading spinner when loading prop is true", () => {
    render(<Button loading>Loading</Button>);
    const spinner = screen.getByRole("img", { hidden: true }); // Lucide icons render as <svg role="img">
    expect(spinner).toBeInTheDocument();
  });
});
