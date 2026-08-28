import { test, expect } from '@playwright/test';

test('loads the PodTrace app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PodTrace/);
  await expect(page.getByText('PodTrace')).toBeVisible();
  await expect(
    page.getByText('Trace every step, from apply to running'),
  ).toBeVisible();
});
