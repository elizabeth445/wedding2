import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('output');
for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`композиция и скриншоты ${width}px`, async ({ browser }) => {
    await mkdir(output, { recursive: true });
    const page = await browser.newPage({
      viewport: { width, height: width < 768 ? 844 : 1000 },
      hasTouch: width < 700,
      reducedMotion: 'reduce',
    });
    await page.goto('http://127.0.0.1:5192');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('button', { name: 'Відкрити запрошення' })).toBeInViewport({
      ratio: 1,
    });
    if (width < 700) {
      const cover = await page.locator('.cover-image').boundingBox();
      expect(Math.abs(cover!.x + cover!.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    }
    await page.screenshot({ path: path.join(output, `cover-${width}.png`) });
    await page.getByRole('button', { name: 'Відкрити запрошення' }).click();
    for (const section of await page.locator('main section, footer').all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(70);
    }
    await page.evaluate(() =>
      Promise.all([...document.images].map((img) => img.decode().catch(() => {}))),
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: path.join(output, `editorial-${width}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    if (width < 700) {
      for (const selector of [
        '.hero-visual',
        '.story-photo',
        '.dress-detail',
        '.event-venue-preview img',
        '.venue-image',
        '.venue-address',
        '.closing-image',
        '.rsvp-save',
      ]) {
        const bounds = await page.locator(selector).boundingBox();
        expect(
          Math.abs(bounds!.x + bounds!.width / 2 - width / 2),
          `${selector} must stay on the phone's center axis`,
        ).toBeLessThanOrEqual(1);
      }
    }
    const overflow = await page.locator('body *').evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          if (style.opacity === '0') return false;
          let left = rect.left,
            right = rect.right;
          for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
            if (getComputedStyle(ancestor).opacity === '0') return false;
            if (
              ['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(ancestor).overflowX)
            ) {
              const bounds = ancestor.getBoundingClientRect();
              left = Math.max(left, bounds.left);
              right = Math.min(right, bounds.right);
            }
          }
          return (
            rect.width > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            left < right &&
            (left < -1 || right > innerWidth + 1)
          );
        })
        .map((e) => `${e.tagName}.${e.className}`),
    );
    expect(overflow).toEqual([]);
    expect(
      await page
        .locator('img')
        .evaluateAll((images) => images.every((img) => img.complete && img.naturalWidth > 0)),
    ).toBe(true);
    await page.locator('#rsvp').scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Зберегти відповідь' })).toBeVisible();
    await page.close();
  });
}
