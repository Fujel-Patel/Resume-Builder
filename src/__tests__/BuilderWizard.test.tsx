// src/__tests__/BuilderWizard.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import BuilderWizard from "@/components/resume/BuilderWizard";
import { ToastProvider } from "@/components/ui/ToastProvider";

// Mock templates to avoid heavy imports
vi.mock("@/components/templates", () => ({
  getAllTemplates: vi.fn(() => [
    { id: "modern-professional", name: "Modern", description: "", thumbnail: "", tags: [] },
    { id: "classic-conservative", name: "Classic", description: "", thumbnail: "", tags: [] },
  ]),
  TemplateCard: (props: any) => (
    <div data-testid="template-card" onClick={props.onSelect}> {props.template.name} </div>
  ),
}));

function renderWizard() {
  return render(
    <ToastProvider>
      <BuilderWizard initialDraft={null} />
    </ToastProvider>
  );
}

async function fillPersonalInfo() {
  const nameInput = await screen.findByLabelText(/Full Name/i);
  const emailInput = await screen.findByLabelText(/Email/i);
  fireEvent.change(nameInput, { target: { value: "John Doe" } });
  fireEvent.blur(nameInput);
  fireEvent.change(emailInput, { target: { value: "john@example.com" } });
  fireEvent.blur(emailInput);
}

describe("BuilderWizard component integration", () => {
  it("renders initial step and allows navigation", async () => {
    renderWizard();

    // Verify first step label appears (Personal Info)
    expect(screen.getByText(/Personal Info/i)).toBeInTheDocument();

    await fillPersonalInfo();

    const nextButton = await screen.findByRole("button", { name: /next/i });
    await waitFor(() => expect(nextButton).not.toBeDisabled());
    fireEvent.click(nextButton);

    // After clicking, second step should appear (Work Experience)
    await waitFor(() => {
      expect(screen.getAllByText(/Work Experience/i).length).toBeGreaterThan(0);
    });
  });

  it("enables undo after a saved change", async () => {
    renderWizard();
    const undoBtn = screen.getByRole("button", { name: /undo/i });
    expect(undoBtn).toBeDisabled();

    await fillPersonalInfo();

    // Submitting the step calls saveStep -> setData, which pushes to history.
    const nextButton = await screen.findByRole("button", { name: /next/i });
    await waitFor(() => expect(nextButton).not.toBeDisabled());
    fireEvent.click(nextButton);

    await waitFor(() => expect(undoBtn).not.toBeDisabled());
  });
});
