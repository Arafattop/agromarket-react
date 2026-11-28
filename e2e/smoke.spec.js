import { test, expect } from '@playwright/test';

// Только чтение: ничего не создаёт и не меняет. Можно запускать против продакшена.
test.setTimeout(90_000);

test('@smoke каталог открывается и показывает товары', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Каталог' })).toBeVisible();
  await expect(page.getByTestId('product-card').first()).toBeVisible();
});

test('@smoke прямая ссылка на внутренний путь не даёт 404', async ({ page }) => {
  const response = await page.goto('/any/deep/link');
  expect(response.status()).toBe(200);
});
