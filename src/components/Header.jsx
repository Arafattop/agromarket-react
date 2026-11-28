export default function Header({ cartCount = 0, onOpenCart }) {
  return (
    <header className="site-header">
      <a href="#" className="logo">🌾 АгроМаркет</a>

      <nav>
        <ul className="nav-links">
          <li><a href="#catalog">Каталог</a></li>
          <li><a href="#delivery">Доставка</a></li>
          <li><a href="#contact">Контакты</a></li>
        </ul>
      </nav>

      <button type="button" className="cart" onClick={onOpenCart}>🛒 Корзина: {cartCount}</button>
    </header>
  )
}
