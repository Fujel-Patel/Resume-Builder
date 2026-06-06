// src/__tests__/BuilderWizard.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BuilderWizard from "@/components/resume/BuilderWizard";
import * as templateModule from "@/components/templates";

// Mock templates to avoid heavy imports
jest.mock("@/components/templates", () => ({
  getAllTemplates: jest.fn(() => [
    { id: "modern-professional", name: "Modern", thumbnail: "" },
    { id: "classic-conservative", name: "Classic", thumbnail: "" },
  ]),
  TemplateCard: (props: any) => (
    <div data-testid="template-card" onClick={props.onSelect}> {props.template.name} </div>
  ),
}));

describe("BuilderWizard component integration", () => {
  it("renders initial step and allows navigation", async () => {
    render(<BuilderWizard initialDraft={null} />);

    // Verify first step label appears (Personal Info)
    expect(screen.getByText(/Personal Info/i)).toBeInTheDocument();

    // Click Next button (provided by step component) – we need to locate it
    const nextButton = await screen.findByRole("button", { name: /next/i });
    fireEvent.click(nextButton);

    // After clicking, second step should appear (Work Experience)
    await waitFor(() => {
      expect(screen.getByText(/Work Experience/i)).toBeInTheDocument();
    });
  });

  it("enables undo after a change", async () => {
    render(<BuilderWizard initialDraft={null} />);
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    expect(undoBtn).toBeDisabled();

    // Simulate a change via setData – we can trigger a field change in PersonalInfoForm
    const nameInput = await screen.findByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    // Save step automatically updates history
    expect(undoBtn).not.toBeDisabled();
  });
});
