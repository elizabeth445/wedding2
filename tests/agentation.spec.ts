import { test, expect } from '@playwright/test';

test('Agentation annotates the cover and follows native dialogs without duplicates', async ({
  page,
}) => {
  await page.goto('/');
  const portal = page.locator('[data-agentation-portal]');
  const launcher = page.getByRole('button', { name: 'Start feedback mode' });
  const feedback = page.getByPlaceholder('What should change?');

  await expect(page.locator('.invitation-overlay [data-agentation-portal]')).toHaveCount(1);
  await launcher.click();
  await page.locator('.cover-first').click();
  await expect(feedback).toBeVisible();
  await feedback.fill('Перевірка помітки на обкладинці');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(feedback).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy feedback' })).toBeEnabled();
  await expect(page.locator('.invitation-overlay[open]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Exit', exact: true }).click();

  await page.getByRole('button', { name: 'Пропустити' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(portal).toHaveCount(1);
  await launcher.click();
  await expect(page.getByRole('button', { name: 'Copy feedback' })).toBeEnabled();
  await page.getByRole('button', { name: 'Exit', exact: true }).click();

  await page.getByRole('button', { name: 'Збільшити фотографію нашої історії' }).click();
  await expect(page.locator('.photo-viewer [data-agentation-portal]')).toHaveCount(1);
  await launcher.click();
  await page.locator('.photo-viewer > .micro').click();
  await expect(feedback).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Exit', exact: true }).click();
  await page.getByRole('button', { name: 'Закрити фотографію' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(portal).toHaveCount(1);
  await expect(launcher).toBeVisible();

  await page.locator('header').getByRole('button', { name: 'Обкладинка', exact: true }).click();
  await expect(page.locator('.invitation-overlay [data-agentation-portal]')).toHaveCount(1);
  await expect(launcher).toBeVisible();
  await expect(portal).toHaveCount(1);
});
