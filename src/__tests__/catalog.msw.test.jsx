import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../test/server.js';
import App from '../App.jsx';

describe('Каталог через MSW: состояния экрана', () => {
  it('пока данные грузятся, показывает «Загрузка…»', async () => {
    server.use(http.get('*/api/products', async () => {
      await delay(300);
      return HttpResponse.json([]);
    }));
    render(<App />);

    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
    expect(await screen.findByText('Ничего не найдено')).toBeInTheDocument();
  });

  it('сервер отдал товары — они появляются на экране', async () => {
    render(<App />);
    expect(await screen.findByText('Молоко фермерское')).toBeInTheDocument();
    expect(screen.getByText('Картофель')).toBeInTheDocument();
  });

  it('пустой каталог — понятное сообщение', async () => {
    server.use(http.get('*/api/products', () => HttpResponse.json([])));
    render(<App />);
    expect(await screen.findByText('Ничего не найдено')).toBeInTheDocument();
  });

  it('ошибка сервера (500) — сообщение, а не пустой экран', async () => {
    const requested = vi.fn();
    server.events.on('request:start', ({ request }) => requested(request.url));
    server.use(http.get('*/api/products', () =>
      HttpResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })));

    render(<App />);

    expect(await screen.findByText(/не удалось загрузить товары/i)).toBeInTheDocument();
    // Проверяем, что запрос действительно ушёл на сервер, а не упал до отправки
    expect(requested).toHaveBeenCalledWith(expect.stringContaining('/api/products'));
    server.events.removeAllListeners();
  });
});
