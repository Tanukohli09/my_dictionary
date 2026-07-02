const { test, expect } = require('@playwright/test');

test('desktop layout uses full website shell and persistent navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?screen=dictionary', { waitUntil: 'networkidle' });

  await expect(page.getByText('Find a word')).toBeVisible();
  await expect(page.getByText('Saved words')).toBeVisible();
  await expect(page.getByPlaceholder('Search your words...')).toBeVisible();
  await expect(page.getByText('9:41')).toHaveCount(0);

  await page.getByText('Practice quiz').click();
  await expect(page.getByText('Review', { exact: true }).first()).toBeVisible();
});
