const { test, expect } = require('@playwright/test');

test('primary navigation, sorting, detail, and back flow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByText('Navigate')).toBeVisible();
  await page.getByText('Dictionary', { exact: true }).last().click();
  await expect(page.getByPlaceholder('Search your words...')).toBeVisible();

  await page.getByRole('button', { name: 'Sort dictionary' }).click();
  await expect(page.getByText('Sort by')).toBeVisible();
  await page.getByText('Newest', { exact: true }).click();
  await expect(page.getByText('Added May 12, 2025')).toBeVisible();

  await page.getByText('Resilient').first().click();
  await expect(page.getByText('My meaning')).toBeVisible();
  await page.getByText('‹').first().click();
  await expect(page.getByPlaceholder('Search your words...')).toBeVisible();
});
