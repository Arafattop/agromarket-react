import '@testing-library/jest-dom/vitest';   // матчеры toBeInTheDocument, toBeDisabled
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();             // убираем отрисованное после каждого теста
  vi.restoreAllMocks();  // снимаем все подмены fetch
  localStorage.clear();  // токен из прошлого теста не должен мешать
});
