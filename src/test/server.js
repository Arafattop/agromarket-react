import { setupServer } from 'msw/node';
import { handlers } from './handlers.js';

// Перехватывает fetch в тестах: сервер не нужен, ответы заранее заданы
export const server = setupServer(...handlers);
