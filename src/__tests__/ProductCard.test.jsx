import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../components/ProductCard.jsx';

const product = { id: 1, name: 'Мёд гречишный', price: 3500, image: '/images/med.jpg' };

describe('ProductCard', () => {
  it('показывает название, цену и картинку', () => {
    render(<ProductCard product={product} onAdd={() => {}} />);
    expect(screen.getByText('Мёд гречишный')).toBeInTheDocument();
    expect(screen.getByText('3500 ₸')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Мёд гречишный' })).toBeInTheDocument();
  });

  it('кнопка «В корзину» вызывает onAdd с товаром', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<ProductCard product={product} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: 'В корзину' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(product);
  });

  it('у товара недели есть бейдж, у обычного товара его нет', () => {
    const { rerender } = render(<ProductCard product={product} onAdd={() => {}} featured />);
    expect(screen.getByText('Товар недели')).toBeInTheDocument();

    rerender(<ProductCard product={product} onAdd={() => {}} featured={false} />);
    expect(screen.queryByText('Товар недели')).not.toBeInTheDocument();
  });
});
