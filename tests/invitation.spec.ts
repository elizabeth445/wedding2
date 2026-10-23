import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function enter(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function replay(page: Page) {
  const menu = page.getByRole('button', { name: 'Відкрити меню' });
  if (await menu.isVisible()) await menu.click();
  await page.locator('header').getByRole('button', { name: 'Обкладинка', exact: true }).click();
}

test('фотография появляется при открытии и вылетает выше конверта', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.invitation-card');
  const initial = await card.boundingBox();
  await expect(page.locator('.cover-image')).toHaveCSS('opacity', '0');
  await page.getByRole('button', { name: 'Відкрити запрошення' }).click();
  await expect(page.locator('.cover-image')).toHaveCSS('opacity', '1');
  await expect.poll(async () => (await card.boundingBox())!.y).toBeLessThan(initial!.y - 20);
  await expect(card).toBeInViewport({ ratio: 1 });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
});

test('печать конверта открывает приглашение и допускает выход во время анимации', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Розкрити конверт' }).click();
  await expect(page.getByRole('button', { name: 'Відкрити запрошення' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
  await replay(page);
  await page.getByRole('button', { name: 'Розкрити конверт' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
});

test('обложка открывается, повторяется и закрывается с корректным фокусом', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Відкрити запрошення' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
  await replay(page);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await replay(page);
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('история переключается, фото открывается и возвращает фокус', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: '2026', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Без жодних «якщо»' })).toBeVisible();
  await expect(page.getByRole('button', { name: '2026', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const photo = page.getByRole('button', { name: 'Збільшити фотографію нашої історії' });
  await photo.click();
  await expect(page.getByRole('dialog', { name: 'Фотографія нашої історії' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(photo).toBeFocused();
});

test('RSVP: валидация, сохранение, перезагрузка и редактирование', async ({ page }) => {
  await enter(page);
  await page.getByRole('button', { name: 'Зберегти відповідь' }).click();
  await expect(page.getByRole('alert')).toContainText('щонайменше 2 символи');
  await expect(page.getByLabel('Ваше ім’я та прізвище')).toBeFocused();
  await page.getByLabel('Ваше ім’я та прізвище').fill('  Тестовий гість  ');
  await page.getByRole('button', { name: 'Зберегти відповідь' }).click();
  await expect(page.getByRole('alert')).toContainText('Оберіть');
  await page.getByRole('radio', { name: 'Так, із радістю' }).check();
  await page.getByLabel('Кілька слів для нас').fill('Без горіхів, будь ласка.');
  await page.getByRole('button', { name: 'Зберегти відповідь' }).click();
  await expect(page.getByRole('heading', { name: 'До зустрічі!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'До зустрічі!' })).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.getByRole('heading', { name: 'До зустрічі!' })).toBeVisible();
  await expect(page.locator('.rsvp-confirmation')).toContainText('Тестовий гість');
  await page.getByRole('button', { name: 'Редагувати відповідь' }).click();
  await expect(page.getByLabel('Ваше ім’я та прізвище')).toHaveValue('Тестовий гість');
  await expect(page.getByLabel('Кілька слів для нас')).toHaveValue('Без горіхів, будь ласка.');
  await page.getByRole('radio', { name: 'На жаль, не зможу' }).check();
  await page.getByRole('button', { name: 'Зберегти відповідь' }).click();
  await expect(page.getByRole('heading', { name: 'Дякуємо, що дали знати.' })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('am-wedding-rsvp-v1:default')!)),
  ).toMatchObject({ version: 1, name: 'Тестовий гість', attendance: 'no' });
});

test('персонализация из URL и отдельные ответы гостей', async ({ page }) => {
  await page.goto('/?guest=guest-example');
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.getByRole('heading', { name: 'Дорогий гостю!' })).toBeVisible();
  await expect(page.getByLabel('Ваше ім’я та прізвище')).toHaveValue('Гість');
  await page.getByRole('radio', { name: 'Так, із радістю' }).check();
  await page.getByRole('button', { name: 'Зберегти відповідь' }).click();
  await page.goto('/?guest=unknown');
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.getByRole('heading', { name: 'Дорогі наші!' })).toBeVisible();
  await expect(page.getByLabel('Ваше ім’я та прізвище')).toHaveValue('');
});

test('поврежденное и недоступное хранилище обрабатываются без ложного успеха', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('am-wedding-rsvp-v1:default', '{"version":1,"name":9}');
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await enter(page);
  await page.getByLabel('Ваше ім’я та прізвище').fill('Тестовий гість');
  await page.getByRole('radio', { name: 'Так, із радістю' }).check();
  await page.getByRole('button', { name: 'Зберегти відповідь' }).click();
  await expect(page.getByRole('alert')).toContainText('Браузер не дозволив');
  await expect(page.getByRole('heading', { name: 'До зустрічі!' })).toHaveCount(0);
});

test('скачивается валидный ICS с украинским текстом и временем UTC', async ({ page }) => {
  await enter(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Додати в календар' }).click();
  const download = await downloadPromise;
  const content = await readFile((await download.path())!, 'utf8');
  const unfolded = content.replace(/\r\n /g, '');
  expect(download.suggestedFilename()).toBe('anastasiia-mark.ics');
  expect(unfolded).toContain('DTSTART:20270825T130000Z');
  expect(unfolded).toContain('DTEND:20270825T200000Z');
  expect(unfolded).toContain('SUMMARY:Весілля: Анастасія та Марк');
  expect(unfolded).toContain('LOCATION:Equides Club\\, с. Лісники\\, вул. Вишнева\\, 36');
  for (const line of content.split('\r\n')) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);
  await expect(page.getByRole('link', { name: 'Прокласти маршрут' })).toHaveAttribute(
    'href',
    /destination=Equides/,
  );
  await expect(page.getByRole('link', { name: 'Сайт локації' })).toHaveAttribute(
    'href',
    'https://www.equides.com.ua/',
  );
});

test('мобильное меню: Escape, фокус и переход к разделу', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  const toggle = page.getByRole('button', { name: 'Відкрити меню' });
  await toggle.click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.getByRole('link', { name: 'Наша історія', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(page.getByRole('navigation')).not.toBeVisible();
  await toggle.click();
  await page.getByRole('link', { name: 'День весілля', exact: true }).click();
  await expect(page).toHaveURL(/#day$/);
  await expect(page.getByRole('navigation')).not.toBeVisible();
});

test('смена reduced-motion прерывает интро и сохраняет доступ к странице', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Відкрити запрошення' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.story-photo img')).toHaveCSS('clip-path', 'none');
});

test('таймер до даты и после начала не показывает отрицательных чисел', async ({ page }) => {
  await page.clock.install({ time: new Date('2027-08-24T12:00:00Z') });
  await enter(page);
  await expect(page.getByRole('timer')).toHaveAttribute('aria-label', /1 день/);
  await page.clock.setSystemTime(new Date('2027-08-25T13:00:05Z'));
  await page.clock.runFor(1000);
  await expect(page.getByRole('heading', { name: 'Наш день настав.' })).toBeVisible();
  await expect(page.getByRole('timer')).not.toContainText('-');
});

test('нет ошибок axe WCAG AA и ошибок загрузки локальных ресурсов', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('button', { name: 'Пропустити' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
