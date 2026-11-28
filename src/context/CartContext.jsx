import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext(null)
const STORAGE_KEY = "cart"

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return [] // в localStorage мусор — начинаем с пустой корзины
  }
}

// Позиция: { productId, name, price, quantity }. price нужна только для показа:
// сумму на сервере считают заново по ценам из базы.
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function add(product) {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === product.id)
      if (found) {
        return prev.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  function setQuantity(productId, quantity) {
    setItems((prev) => (quantity <= 0
      ? prev.filter((i) => i.productId !== productId)
      : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))))
  }

  const clear = () => setItems([])
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart() вызван вне <CartProvider>")
  return ctx
}
