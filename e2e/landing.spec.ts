import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows the hero heading and CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Resume AI');
    await expect(page.getByRole('link', { name: /Create Resume|Get Started|Build/i })).toBeVisible();
  });
});

test.describe('Dashboard shell', () => {
  test('sidebar loads without crashing', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
