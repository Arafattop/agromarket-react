import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

const products = [
  { id: 1, name: 'Молоко фермерское', price: 450, image: '/images/mlk.jpg' },
];

function mockCatalog(body = products, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('App: связка каталога и API', () => {
  it('гость видит товары из API и форму входа', async () => {
    const fetchSpy = mockCatalog();
    render(<App />);

    expect(await screen.findByText('Молоко фермерское')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/products/);
  });

  it('гость не видит форму добавления товара', async () => {
    mockCatalog();
    render(<App />);
    await screen.findByText('Молоко фермерское');

    expect(screen.queryByRole('heading', { name: 'Новый товар' })).not.toBeInTheDocument();
  });

  it('если сервер недоступен, показывает понятную ошибку', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);

    expect(await screen.findByText(/не удалось загрузить товары/i)).toBeInTheDocument();
  });
});
