import { useState } from "react"
import { useCart } from "../context/CartContext.jsx"
import { apiFetch } from "../api.js"

const money = (n) => `${n.toLocaleString("ru-RU")} ₸`

export default function CartPage({ onBack, onOrdered }) {
  const { items, setQuantity, clear, total } = useCart()
  const [address, setAddress] = useState("")
  const [error, setError] = useState(null)   // { message, details }
  const [sending, setSending] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const loggedIn = Boolean(localStorage.getItem("token"))

  if (orderId) {
    return (
      <section className="contact">
        <h2>Заказ №{orderId} оформлен</h2>
        <button type="button" onClick={onBack}>Вернуться в каталог</button>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="contact">
        <h2>Корзина</h2>
        <p>Корзина пуста.</p>
        <button type="button" onClick={onBack}>В каталог</button>
      </section>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      // отправляем только id и количество: цену и сумму считает сервер
      const data = await apiFetch("/shop-orders", {
        method: "POST",
        body: JSON.stringify({
          address,
          items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        }),
      })
      clear()
      setOrderId(data.id)
      onOrdered?.(data)
    } catch (err) {
      setError({ message: err.message, details: err.details ?? [] })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="contact">
      <h2>Корзина</h2>
      <table>
        <thead>
          <tr><th>Товар</th><th>Цена</th><th>Количество</th><th>Сумма</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.productId}>
              <td>{i.name}</td>
              <td>{money(i.price)}</td>
              <td>
                <button type="button" aria-label={`Меньше: ${i.name}`} disabled={i.quantity <= 1}
                  onClick={() => setQuantity(i.productId, i.quantity - 1)}>−</button>
                <span> {i.quantity} </span>
                <button type="button" aria-label={`Больше: ${i.name}`}
                  onClick={() => setQuantity(i.productId, i.quantity + 1)}>+</button>
              </td>
              <td>{money(i.price * i.quantity)}</td>
              <td>
                <button type="button" onClick={() => setQuantity(i.productId, 0)}>
                  Удалить {i.name}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Итого: <strong data-testid="cart-total">{money(total)}</strong></p>

      {error && (
        <div role="alert">
          <p>{error.message}</p>
          <ul>
            {error.details.map((d) => (
              <li key={d.productId ?? d.field}>
                {d.message ?? `${d.name}: в наличии ${d.available} шт.`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {loggedIn ? (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Адрес доставки
            <input value={address} onChange={(e) => setAddress(e.target.value)} required minLength={5} />
          </label>
          <button type="submit" disabled={sending}>
            {sending ? "Отправляем…" : "Оформить заказ"}
          </button>
        </form>
      ) : (
        <p>Войдите в аккаунт, чтобы оформить заказ.</p>
      )}
      <button type="button" onClick={onBack}>Назад в каталог</button>
    </section>
  )
}
