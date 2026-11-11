import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Catalog from '../components/Catalog.jsx';

const products = [
  { id: 1, name: 'Молоко фермерское', price: 450, image: '/images/mlk.jpg' },
  { id: 2, name: 'Картофель', price: 180, image: '/images/pot.jpg' },
];

// Базовые props; в каждом тесте меняем только то, что проверяем
const base = {
  products,
  search: '',
  onSearch: () => {},
  loading: false,
  error: '',
  onAdd: () => {},
  featuredId: 1,
};

describe('Catalog: три состояния экрана', () => {
  it('загрузка: показывает «Загрузка…» и не показывает товары', () => {
    render(<Catalog {...base} products={[]} loading />);
    expect(screen.getByText('Загрузка…')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'В корзину' })).not.toBeInTheDocument();
  });

  it('данные: показывает все карточки и бейдж у товара недели', () => {
    render(<Catalog {...base} />);
    expect(screen.getByText('Молоко фермерское')).toBeInTheDocument();
    expect(screen.getByText('Картофель')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'В корзину' })).toHaveLength(2);
    expect(screen.getByText('Товар недели')).toBeInTheDocument();
  });

  it('ошибка: показывает текст ошибки и не показывает товары', () => {
    render(<Catalog {...base} products={[]} error="Не удалось загрузить товары" />);
    expect(screen.getByText('Не удалось загрузить товары')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'В корзину' })).not.toBeInTheDocument();
  });

  it('пустой результат поиска: «Ничего не найдено»', () => {
    render(<Catalog {...base} products={[]} search="яблоко" />);
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
  });
});

describe('Catalog: поиск', () => {
  it('ввод в строку поиска передаёт текст наверх', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Catalog {...base} onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox'), 'м');

    expect(onSearch).toHaveBeenCalledWith('м');
  });

  it('клик «В корзину» в списке передаёт нужный товар', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<Catalog {...base} onAdd={onAdd} />);

    await user.click(screen.getAllByRole('button', { name: 'В корзину' })[1]);

    expect(onAdd).toHaveBeenCalledWith(products[1]);
  });
});
