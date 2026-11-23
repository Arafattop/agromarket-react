import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../test/server.js';
import LoginForm from '../components/LoginForm.jsx';

async function fillAndSubmit(user, email, password) {
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Пароль'), password);
  await user.click(screen.getByRole('button', { name: 'Войти' }));
}

describe('Вход через MSW', () => {
  it('верный пароль: пользователь и токен передаются наверх', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
    expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({ name: 'Айгерим' }), 'test-token');
  });

  it('неверный пароль (401): текст ошибки с сервера', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await fillAndSubmit(user, 'farmer@agro.kz', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль');
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('слишком много попыток (429): сообщение из ответа', async () => {
    server.use(http.post('*/api/auth/login', () => HttpResponse.json(
      { error: 'Слишком много попыток. Попробуйте через 15 минут' },
      { status: 429 })));
    const user = userEvent.setup();
    render(<LoginForm onLogin={() => {}} />);

    await fillAndSubmit(user, 'farmer@agro.kz', 'secret123');

    expect(await screen.findByRole('alert')).toHaveTextContent(/слишком много попыток/i);
  });
});
