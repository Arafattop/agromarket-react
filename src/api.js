export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Обёртка над fetch: добавляет токен, разбирает JSON, ошибки API превращает в исключения
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json();

  if (res.status === 401 && token) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Ошибка ${res.status}`);
    error.details = data?.details;   // подробности валидации: список полей
    throw error;
  }
  return data;
}

// Текст ошибки для показа пользователю: если есть подробности — перечисляем их
export function formatError(err) {
  if (Array.isArray(err.details) && err.details.length > 0) {
    return err.details.map((d) => d.message).join('; ');
  }
  return err.message;
}
