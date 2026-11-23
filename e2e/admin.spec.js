import { test, expect } from '@playwright/test';

// Пишет в базу: запускается только на локальном API с базой для разработки
test.skip(!!(process.env.E2E_BASE_URL || process.env.BASE_URL),
  'Тест пишет в базу: на продакшен не запускается');
test.skip(!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD,
  'Задайте E2E_ADMIN_EMAIL и E2E_ADMIN_PASSWORD (см. .env.e2e.example)');

async function loginAsAdmin(page) {
  await page.goto('/');
  await page.getByLabel('Email', { exact: true }).fill(process.env.E2E_ADMIN_EMAIL);
  await page.getByLabel('Пароль', { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByText(/Вы вошли как/)).toBeVisible();
}

test('администратор добавляет товар, и он появляется в каталоге', async ({ page }) => {
  const name = `E2E мёд ${Date.now()}`;
  await loginAsAdmin(page);

  await page.getByLabel('Название').fill(name);
  await page.getByLabel('Цена').fill('777');
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByText(name)).toBeVisible();
});

test('цена -500 блокируется браузером: форма не отправляется', async ({ page }) => {
  await loginAsAdmin(page);
  const price = page.getByLabel('Цена');

  await price.fill('-500');
  // min="0": браузер сам считает значение недопустимым, запрос не уходит
  expect(await price.evaluate((el) => el.validity.valid)).toBe(false);
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByTestId('product-card').filter({ hasText: '-500' })).toHaveCount(0);
});
