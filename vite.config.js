import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',                       // JSX без import React, как в приложении
  },
  test: {
    environment: 'jsdom',                   // браузерное окружение для тестов
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.test.{js,jsx}'],    // Playwright-тесты из e2e/ сюда не попадают
    css: false,
  },
});