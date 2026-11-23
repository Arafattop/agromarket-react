import { http, HttpResponse } from 'msw';

export const products = [
  { id: 1, name: 'Молоко фермерское', price: 450, unit: 'кг', image: '/images/mlk.jpg' },
  { id: 2, name: 'Картофель', price: 180, unit: 'кг', image: '/images/pot.jpg' },
];

// '*' в начале — подходит любой адрес API (localhost, Render и т.д.)
export const handlers = [
  http.get('*/api/products', () => HttpResponse.json(products)),

  http.post('*/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json();
    if (password === 'secret123') {
      return HttpResponse.json({
        user: { id: 7, name: 'Айгерим', email, role: 'user' },
        token: 'test-token',
      });
    }
    return HttpResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
  }),

  http.post('*/api/products', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body }, { status: 201 });
  }),
];
