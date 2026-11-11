import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm.jsx';

function mockResponse(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('LoginForm', () => {
  it('отправляет e-mail и пароль на /auth/login и передаёт пользователя и токен наверх', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    const fetchSpy = mockResponse({
      user: { id: 1, name: 'Айгерим', role: 'user' },
      token: 't-123',
    });
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText('Email'), 'farmer@agromarket.kz');
    await user.type(screen.getByLabelText('Пароль'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(onLogin).toHaveBeenCalledWith({ id: 1, name: 'Айгерим', role: 'user' }, 't-123');
    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/login$/);
    expect(JSON.parse(options.body)).toEqual({
      email: 'farmer@agromarket.kz',
      password: 'secret123',
    });
  });

  it('неверный пароль: показывает ошибку сервера и не вызывает onLogin', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    mockResponse({ error: 'Неверный email или пароль' }, 401);
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText('Email'), 'nobody@agromarket.kz');
    await user.type(screen.getByLabelText('Пароль'), 'wrong-pass');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль');
    expect(onLogin).not.toHaveBeenCalled();
  });

  it('переключение на регистрацию показывает поле «Имя»', async () => {
    const user = userEvent.setup();
    render(<LoginForm onLogin={() => {}} />);
    expect(screen.queryByLabelText('Имя')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Нет аккаунта? Регистрация' }));

    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
  });
});
