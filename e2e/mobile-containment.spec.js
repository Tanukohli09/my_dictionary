const { test, expect } = require('@playwright/test');

test('first-run onboarding remains reachable on a short phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 480 });
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto('/', { waitUntil: 'networkidle' });

  const start = page.getByRole('button', { name: 'Start with your first word' });
  await expect(start).toBeVisible();
  const scrollable = await start.evaluate((element) => {
    let node = element.parentElement;
    while (node) {
      const style = window.getComputedStyle(node);
      if (['auto', 'scroll'].includes(style.overflowY) && node.scrollHeight > node.clientHeight) return true;
      node = node.parentElement;
    }
    return false;
  });
  const layout = await start.evaluate((element) => {
    const nodes = [];
    let node = element;
    while (node) {
      const style = window.getComputedStyle(node);
      nodes.push({ tag: node.tagName, className: node.className, overflowY: style.overflowY, height: node.clientHeight, scrollHeight: node.scrollHeight });
      node = node.parentElement;
    }
    return nodes;
  });
  expect(scrollable, JSON.stringify(layout)).toBeTruthy();
  await start.scrollIntoViewIfNeeded();
  await expect(start).toBeInViewport();
  await start.click();
  await expect(page.getByPlaceholder('Search a word...')).toBeVisible();
});

test('signed-out Profile content scrolls without horizontal or bottom-tab overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('my-dictionary.onboarded.v1', 'yes');
    window.localStorage.setItem('my-dictionary.words.v1', '[]');
    window.localStorage.setItem('my-dictionary.review-submissions.v1', '[]');
  });
  await page.goto('/?screen=profile', { waitUntil: 'networkidle' });

  await expect(page.getByText('Account', { exact: true })).toBeVisible();
  await expect(page.getByText('Signed in', { exact: true })).toHaveCount(0);
  const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight, documentWidth: document.documentElement.scrollWidth }));
  expect(viewport.documentWidth).toBeLessThanOrEqual(viewport.width);

  const profileTab = page.getByRole('button', { name: 'Profile tab' });
  const tabBox = await profileTab.boundingBox();
  expect(tabBox).not.toBeNull();
  expect(tabBox.y + tabBox.height).toBeLessThanOrEqual(viewport.height + 1);

  const privacyButton = page.getByRole('button', { name: 'Read privacy notice' });
  await privacyButton.scrollIntoViewIfNeeded();
  await expect(privacyButton).toBeInViewport();
});
