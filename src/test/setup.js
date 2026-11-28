import '@testing-library/jest-dom/vitest';   // toBeInTheDocument, toBeDisabled
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server.js';

// 'error': если компонент пошёл по незаданному адресу, тест падает сразу
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();  // убрать подмены, сделанные внутри теста
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();    // токен из одного теста не должен попасть в другой
});

afterAll(() => server.close());
