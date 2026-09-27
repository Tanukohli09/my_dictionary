const { test, expect } = require('@playwright/test');
const { makeWord, seedStorage } = require('./testData');

test.beforeEach(async ({ page }) => {
  await seedStorage(page, [makeWord('Resilient', 'Able to recover quickly')]);
});

test('mobile search controls have accessible names and keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 920 });
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.getByRole('textbox', { name: 'Search a word...' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search tab' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toBeVisible();

  await page.getByRole('button', { name: 'Open navigation menu' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Dictionary menu item' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close navigation menu' }).first()).toBeVisible();
});

test('desktop navigation exposes selected state and theme control', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  await expect(page.getByRole('button', { name: 'Search navigation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Dictionary navigation' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Toggle night mode' })).toBeVisible();
});
