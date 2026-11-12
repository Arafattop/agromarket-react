import { test, expect } from '@playwright/test';

// Каждый запуск — новый покупатель с уникальным e-mail, чужие данные не трогаем
const email = `e2e+${Date.now()}@agromarket.test`;
const password = 'E2e-Test-Password-123';

test('каталог загружается с сервера', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'В корзину' }).first()).toBeVisible();
});

test('прямая ссылка на внутренний путь не даёт 404 (vercel.json)', async ({ page }) => {
  const response = await page.goto('/any/deep/link');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();
});

test('гость не видит форму добавления товара', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Новый товар' })).toHaveCount(0);
});

test('покупатель регистрируется, добавляет товар и оформляет заявку', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Нет аккаунта? Регистрация' }).click();
  await page.getByLabel('Имя', { exact: true }).fill('E2E Покупатель');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Пароль', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByText(/Вы вошли как/)).toBeVisible();

  await page.getByRole('button', { name: 'В корзину' }).first().click();
  await expect(page.getByText('Корзина: 1')).toBeVisible();

  await page.getByLabel('Имя / организация *').fill('E2E Покупатель');
  await page.getByLabel('Email *').fill(email);
  await page.getByLabel('Объём, кг', { exact: false }).fill('12');
  await page.getByRole('button', { name: 'Отправить заявку' }).click();
  await expect(page.getByText(/Заявка №\d+ принята/)).toBeVisible({ timeout: 30_000 });
});
