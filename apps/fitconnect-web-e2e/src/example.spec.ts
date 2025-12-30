import { test, expect } from '@playwright/test';

test('home redirects to clubs and shows Clubs heading', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:4200';
  await page.goto(base + '/');

  // App redirects to /clubs
  await expect(page).toHaveURL(/.*\/clubs/);

  // Clubs page has a visible heading (match the heading element)
  await expect(page.getByRole('heading', { name: 'Clubs' })).toBeVisible();
});
