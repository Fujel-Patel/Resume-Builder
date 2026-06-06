// e2e/visual.test.ts
import { test, expect } from "@playwright/test";

/**
 * Visual regression test for the dashboard builder page.
 * The first run will generate a baseline screenshot under `test-results/`.
 * Subsequent runs compare the screenshot against the baseline.
 */

test.describe("Visual regression", () => {
  test("builder page layout matches snapshot", async ({ page }) => {
    await page.goto("/builder");
    // Wait for main content to load
    await page.waitForSelector("[data-testid=builder-wizard]");
    const screenshot = await page.screenshot();
    // Compare with stored snapshot (Playwright handles snapshot storage automatically)
    expect(screenshot).toMatchSnapshot("builder-page.png");
  });
});
