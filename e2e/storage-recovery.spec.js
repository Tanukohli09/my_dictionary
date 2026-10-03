const { test, expect } = require('@playwright/test');

test('warns instead of presenting corrupted local storage as an empty dictionary', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('my-dictionary.onboarded.v1', 'yes');
    window.localStorage.setItem('my-dictionary.words.v1', '{not-json');
    window.localStorage.setItem('my-dictionary.review-submissions.v1', '[]');
  });

  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.getByRole('alert')).toContainText(/saved data could not be read/i);
  await expect(page.getByRole('button', { name: 'Open Profile to recover saved data' })).toBeVisible();
});
