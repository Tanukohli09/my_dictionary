const { test, expect } = require('@playwright/test');
const { seedStorage } = require('./testData');

test.beforeEach(async ({ page }) => {
  await seedStorage(page);
  await page.goto('/', { waitUntil: 'networkidle' });
});

async function search(page, word) {
  const input = page.getByRole('textbox', { name: 'Search a word...' });
  await input.fill(word);
  await input.press('Enter');
}

test('finds a word through the dictionary proxy', async ({ page }) => {
  await search(page, 'successword');

  await expect(page.getByText('Successword', { exact: true })).toBeVisible();
  await expect(page.getByText('A test definition for successword.', { exact: true })).toBeVisible();
});

test('uses the configured fallback provider when the primary fails', async ({ page }) => {
  await search(page, 'fallbackword');

  await expect(page.getByText('Fallbackword', { exact: true })).toBeVisible();
  await expect(page.getByText('A fallback definition for fallbackword.', { exact: true })).toBeVisible();
});

test('shows a useful not-found message', async ({ page }) => {
  await search(page, 'missingword');

  await expect(page.getByText(/could not find this word/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('shows a timeout message when providers do not respond in time', async ({ page }) => {
  await search(page, 'timeoutword');

  await expect(page.getByText(/taking too long to respond/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('retry recovers from a transient provider failure', async ({ page }) => {
  await search(page, 'retryword');
  await expect(page.getByText(/temporarily unavailable/i)).toBeVisible();

  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Retryword', { exact: true })).toBeVisible();
  await expect(page.getByText('A test definition for retryword.', { exact: true })).toBeVisible();
});
