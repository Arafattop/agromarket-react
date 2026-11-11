import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddProductForm from '../components/AddProductForm.jsx';

function mockResponse(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('AddProductForm', () => {
  it('отправляет цену числом и передаёт созданный товар наверх', async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    const fetchSpy = mockResponse({ id: 9, name: 'Тестовый мёд', price: 700 }, 201);
    render(<AddProductForm onAdded={onAdded} />);

    await user.type(screen.getByLabelText('Название'), 'Тестовый мёд');
    await user.type(screen.getByLabelText('Цена'), '700');
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(onAdded).toHaveBeenCalledWith({ id: 9, name: 'Тестовый мёд', price: 700 });
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.price).toBe(700);          // число, а не строка из input
    expect(body.unit).toBe('кг');          // значение по умолчанию
  });

  it('ошибка сервера показывается в форме', async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    mockResponse({ error: 'name обязателен; price — целое число' }, 400);
    render(<AddProductForm onAdded={onAdded} />);

    await user.type(screen.getByLabelText('Название'), 'x');
    await user.type(screen.getByLabelText('Цена'), '5');
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('name обязателен');
    expect(onAdded).not.toHaveBeenCalled();
  });
});
