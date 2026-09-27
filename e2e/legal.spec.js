const { test, expect } = require('@playwright/test');

test('privacy notice is reachable before onboarding', async ({ page }) => {
  await page.goto('/?screen=privacy', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByText('What stays on your device')).toBeVisible();
  await expect(page.getByText(/does not require an account/i)).toBeVisible();
  await page.getByRole('button', { name: 'Back to app' }).click();
  await expect(page.getByRole('button', { name: 'Start with your first word' })).toBeVisible();
});

test('support page exposes safe reporting guidance', async ({ page }) => {
  await page.goto('/?screen=support', { waitUntil: 'networkidle' });

  await expect(page.getByRole('heading', { name: 'Support' })).toBeVisible();
  await expect(page.getByText('What to include')).toBeVisible();
  await expect(page.getByText(/Do not include private notes/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open My Dictionary support on GitHub' })).toBeVisible();
});
