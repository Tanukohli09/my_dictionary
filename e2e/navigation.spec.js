const { test, expect } = require('@playwright/test');
const { makeWord, seedStorage } = require('./testData');

test.beforeEach(async ({ page }) => {
  await seedStorage(page, [makeWord('Resilient', 'Able to recover quickly')]);
});

test('primary navigation, sorting, detail, and back flow', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByText('Navigate')).toBeVisible();
  await page.getByRole('button', { name: 'Dictionary menu item' }).click();
  await expect(page.getByPlaceholder('Search your words...')).toBeVisible();

  await page.getByRole('button', { name: 'Arrange dictionary words' }).click();
  await expect(page.getByText('Sort by')).toBeVisible();
  await page.getByRole('button', { name: 'Newest: Recently added words' }).click();
  await expect(page.getByText(/Added Jan 1, 2025/)).toBeVisible();

  await page.getByRole('button', { name: /Open Resilient/ }).click();
  await expect(page.getByText('My meaning')).toBeVisible();
  await page.getByRole('button', { name: 'Back to dictionary' }).click();
  await expect(page.getByPlaceholder('Search your words...')).toBeVisible();
});

test('saved word URLs survive browser Back, Forward, and refresh', async ({ page }) => {
  await page.goto('/?screen=dictionary', { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: /Open Resilient/ }).click();
  await expect(page).toHaveURL(/screen=detail.*word=resilient/);
  await expect(page.getByText('My meaning')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/screen=dictionary/);
  await expect(page.getByPlaceholder('Search your words...')).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/screen=detail.*word=resilient/);
  await expect(page.getByText('My meaning')).toBeVisible();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/screen=detail.*word=resilient/);
  await expect(page.getByText('My meaning')).toBeVisible();
});
