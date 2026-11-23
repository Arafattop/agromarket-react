import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server.js';
import AddProductForm from '../components/AddProductForm.jsx';

describe('Форма товара через MSW', () => {
  it('сервер принял товар: он передаётся наверх', async () => {
    const user = userEvent.setup();
    const onAdded = vi.fn();
    render(<AddProductForm onAdded={onAdded} />);

    await user.type(screen.getByLabelText('Название'), 'Мёд липовый');
    await user.type(screen.getByLabelText('Цена'), '2100');
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() => expect(onAdded).toHaveBeenCalledTimes(1));
    expect(onAdded.mock.calls[0][0]).toMatchObject({ name: 'Мёд липовый', price: 2100 });
  });

  it('400 с подробностями: показывает сообщения по полям', async () => {
    server.use(http.post('*/api/products', () => HttpResponse.json({
      error: 'Ошибка валидации',
      details: [{ field: 'price', message: 'Цена должна быть больше 0' }],
    }, { status: 400 })));
    const user = userEvent.setup();
    const onAdded = vi.fn();
    render(<AddProductForm onAdded={onAdded} />);

    await user.type(screen.getByLabelText('Название'), 'Мёд');
    await user.type(screen.getByLabelText('Цена'), '1');
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Цена должна быть больше 0');
    expect(onAdded).not.toHaveBeenCalled();
  });
});
