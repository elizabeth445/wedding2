import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __chromeDraws: number;
  }
}

test('фон рисуется, ставится на паузу и останавливается вне экрана', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.__chromeDraws = 0;
    const proto = window.WebGL2RenderingContext?.prototype;
    if (!proto) return;
    const draw = proto.drawArrays;
    proto.drawArrays = function (this: WebGL2RenderingContext, mode, first, count) {
      if (
        this.canvas instanceof HTMLCanvasElement &&
        this.canvas.classList.contains('liquid-chrome__canvas')
      )
        window.__chromeDraws++;
      return draw.call(this, mode, first, count);
    };
  });
  await page.goto('/');
  await expect(page.locator('.hero-chrome canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Пропустити' }).click();
  const canvas = page.locator('.hero-chrome canvas');
  await expect(canvas).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => window.__chromeDraws)).toBeGreaterThan(2);
  const size = await canvas.evaluate((element: HTMLCanvasElement) => ({
    pixels: element.width * element.height,
    lost: element.getContext('webgl2')?.isContextLost(),
  }));
  expect(size.pixels).toBeLessThanOrEqual(702_000);
  expect(size.lost).toBe(false);

  await page.getByRole('button', { name: 'Призупинити анімацію фону' }).click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(150);
  const paused = await page.evaluate(() => window.__chromeDraws);
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => window.__chromeDraws)).toBe(paused);
  await page.getByRole('button', { name: 'Відновити анімацію фону' }).click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.__chromeDraws)).toBeGreaterThan(paused);

  await page.locator('#venue').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const offscreen = await page.evaluate(() => window.__chromeDraws);
  await page.waitForTimeout(180);
  expect(await page.evaluate(() => window.__chromeDraws)).toBe(offscreen);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => window.__chromeDraws)).toBeGreaterThan(offscreen);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(canvas).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Призупинити анімацію фону' })).toHaveCount(0);
});

test('без WebGL приглашение, детали и программа остаются доступны', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl2') return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.letter-flourish')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.schedule-icon svg')).toHaveCount(6);
  await page.locator('#day').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Солодкий момент' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('жемчужная программа раскрывает события с клавиатуры, палитра меняет совет', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустити', exact: true }).click();
  const time = page.getByRole('button', { name: '21:00 — Солодкий момент', exact: true });
  await time.focus();
  await time.press('Enter');
  await expect(time).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#moment-4')).toBeVisible();
  await expect(page.locator('#moment-0')).toBeHidden();
  await time.press('Space');
  await expect(time).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#moment-4')).toBeHidden();
  const fabrics = page.getByRole('group', { name: 'Відтінки та фактури дрескоду' });
  const silver = fabrics.getByRole('button', { name: 'Срібло З акцентом', exact: true });
  await silver.click();
  await expect(silver).toHaveAttribute('aria-pressed', 'true');
  await expect(
    fabrics.getByRole('button', { name: 'Чорний Матовий', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('.fabric-note')).toHaveText(
    'Делікатний блиск в аксесуарах, прикрасах або деталях вашого образу.',
  );
});
