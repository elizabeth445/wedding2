import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';

test.use({ hasTouch: true, isMobile: true });

const viewports = [
  [320, 480],
  [360, 560],
  [375, 548],
  [375, 667],
  [390, 664],
  [393, 659],
  [402, 690],
  [414, 715],
  [430, 740],
  [440, 800],
  [667, 375],
  [844, 390],
];
const output = path.resolve('output');
async function expectCoverToFit(page: Page) {
  const button = page.getByRole('button', { name: 'Відкрити запрошення' });
  await expect(button).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('button', { name: 'Пропустити' })).toBeInViewport({ ratio: 1 });
  const size = await page.locator('.invitation-overlay').evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    height: el.clientHeight,
    scrollTop: el.scrollTop,
    width: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));
  expect(size.scrollTop).toBe(0);
  expect(size.scrollHeight).toBeLessThanOrEqual(size.height + 1);
  expect(size.width).toBeLessThanOrEqual(size.clientWidth + 1);
  const viewport = page.viewportSize()!;
  if (viewport.width <= 700 && viewport.height > viewport.width) {
    const photo = await page.locator('.cover-image').boundingBox();
    const caption = await page.locator('.cover-caption').boundingBox();
    const title = await page.locator('.cover-heading').boundingBox();
    expect(Math.abs(photo!.x + photo!.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(1);
    expect(
      caption!.y,
      'Names must remain below the portrait, clear of the couple',
    ).toBeGreaterThanOrEqual(photo!.y + photo!.height + 8);
    expect(title!.y, 'Cover typography must stay clear of the couple').toBeGreaterThanOrEqual(
      photo!.y + photo!.height + 8,
    );
  }
}

for (const [width, height] of viewports) {
  test(`opening action fits the visible phone window ${width}×${height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expectCoverToFit(page);
    const heading = await page.locator('#invitation-title').boundingBox();
    const topBar = await page.locator('.invitation-top').boundingBox();
    expect(heading!.y).toBeGreaterThanOrEqual(topBar!.y + topBar!.height);
    await page.screenshot({
      path: path.join(output, `phone-cover-${info.project.name}-${width}-${height}.png`),
      scale: 'css',
    });
    await page.getByRole('button', { name: 'Відкрити запрошення' }).tap();
    await expect(page.locator('.invitation-overlay')).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.locator('#hero-title')).toBeFocused();
  });
}

test('cover adapts to browser bars, rotation and safe-area space without scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const size of [
    { width: 390, height: 664 },
    { width: 390, height: 540 },
    { width: 844, height: 390 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await expectCoverToFit(page);
  }
  // Reserve the space occupied by a notch and home indicator even in a headless browser.
  await page.addStyleTag({
    content: ':root { --safe-top: 59px; --safe-bottom: 34px; }',
  });
  await expectCoverToFit(page);
  await page.getByRole('button', { name: 'Пропустити' }).tap();
  const menu = page.getByRole('button', { name: 'Відкрити меню' });
  expect((await menu.boundingBox())!.y).toBeGreaterThanOrEqual(59);
  await menu.tap();
  const nav = await page.getByRole('navigation').boundingBox();
  expect(nav!.y).toBeGreaterThanOrEqual(59 + 77);
  expect(nav!.y + nav!.height).toBeLessThanOrEqual(844 - 34);
});

test('touch journey: menu, images, form and returning to the cover', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Відкрити запрошення' }).tap();
  await expect(page.locator('.invitation-overlay')).toHaveCount(0);
  await page.getByRole('button', { name: 'Відкрити меню' }).tap();
  await page.getByRole('link', { name: 'Наша історія', exact: true }).tap();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await page.getByRole('button', { name: 'Збільшити фотографію нашої історії' }).tap();
  await expect(page.getByRole('button', { name: 'Закрити фотографію' })).toBeInViewport({
    ratio: 1,
  });
  const viewer = page.locator('.photo-viewer');
  for (const size of [
    { width: 390, height: 664 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button', { name: 'Закрити фотографію' })).toBeInViewport({
      ratio: 1,
    });
    await expect(viewer.locator('img')).toBeInViewport({ ratio: 1 });
    expect(await viewer.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
  }
  await page.getByRole('button', { name: 'Закрити фотографію' }).tap();
  await page.setViewportSize({ width: 390, height: 664 });
  await expect(
    page.getByRole('button', { name: 'Збільшити фотографію нашої історії' }),
  ).toBeFocused();
  for (const section of await page.locator('main section, footer').all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const selector of ['.hero-visual', '.dress-detail', '.venue-image', '.closing-image']) {
    const bounds = await page.locator(selector).boundingBox();
    expect(Math.abs(bounds!.x + bounds!.width / 2 - 195)).toBeLessThanOrEqual(1);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  expect((await page.locator('.skip-link').boundingBox())!.y).toBeLessThan(0);
  await page.screenshot({
    path: path.join(output, `phone-page-${info.project.name}.png`),
    fullPage: true,
    scale: 'css',
  });
  for (const input of await page.locator('input[type="text"], input:not([type]), textarea').all()) {
    expect(
      await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16);
  }
  await page.getByRole('button', { name: 'Зберегти відповідь' }).tap();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByLabel('Ваше ім’я та прізвище').fill('Тестовий гість');
  await page.getByRole('radio', { name: 'Так, із радістю' }).check();
  await page.getByLabel('Кілька слів для нас').fill('З радістю будемо поруч!');
  await page.getByRole('button', { name: 'Зберегти відповідь' }).tap();
  await expect(page.getByRole('heading', { name: 'До зустрічі!' })).toBeFocused();
  await page.getByRole('button', { name: 'Переглянути обкладинку' }).tap();
  await expectCoverToFit(page);
});

test('short landscape menu keeps every action reachable', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 320 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустити' }).tap();
  await page.getByRole('button', { name: 'Відкрити меню' }).tap();
  const nav = page.getByRole('navigation');
  const bounds = await nav.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(320);
  await nav.getByRole('link', { name: 'Буду з вами' }).tap();
  await expect(page).toHaveURL(/#rsvp$/);
  await expect(nav).not.toBeVisible();
});

test('opening action stays inside a visual viewport shorter than the layout viewport', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(window.visualViewport, 'height', { configurable: true, value: 660 });
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const button = page.getByRole('button', { name: 'Відкрити запрошення' });
  for (const height of [660, 548, 740]) {
    await page.evaluate((height) => {
      Object.defineProperty(window.visualViewport, 'height', { configurable: true, value: height });
      window.visualViewport!.dispatchEvent(new Event('resize'));
    }, height);
    await expect
      .poll(async () => {
        const bounds = await button.boundingBox();
        return bounds!.y + bounds!.height;
      })
      .toBeLessThanOrEqual(height - 14);
    await expectCoverToFit(page);
  }
  await page.screenshot({
    path: path.join(output, `phone-browser-controls-${info.project.name}.png`),
    clip: { x: 0, y: 0, width: 390, height: 740 },
    scale: 'css',
  });
  await button.tap();
  await expect(page.locator('.invitation-overlay')).toHaveCount(0);
});

test('opening action is visible inside an embedded mobile preview', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route('http://127.0.0.1:5192/__test-phone-preview', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><iframe title="Phone preview" src="/" style="position:absolute;left:24px;top:24px;width:390px;height:680px;border:0"></iframe>',
    }),
  );
  await page.goto('/__test-phone-preview');
  const phone = page.frameLocator('iframe');
  const button = phone.getByRole('button', { name: 'Відкрити запрошення' });
  await expect(button).toBeVisible();
  await expect
    .poll(async () => {
      const bounds = await button.boundingBox();
      return bounds!.y + bounds!.height;
    })
    .toBeLessThanOrEqual(24 + 680 - 14);
  await page.screenshot({
    path: path.join(output, `phone-embedded-preview-${info.project.name}.png`),
    clip: { x: 24, y: 24, width: 390, height: 680 },
    scale: 'css',
  });
  await button.tap();
  await expect(phone.locator('.invitation-overlay')).toHaveCount(0);
});
