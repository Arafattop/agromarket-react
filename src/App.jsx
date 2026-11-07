import { useEffect, useState } from "react"
import Header from "./components/Header.jsx"
import Catalog from "./components/Catalog.jsx"
import ContactForm from "./components/ContactForm.jsx"
import Footer from "./components/Footer.jsx"
import LoginForm from "./components/LoginForm.jsx"
import AddProductForm from "./components/AddProductForm.jsx"
import { API_URL, apiFetch } from "./api.js"

const FEATURED_ID = 1 // «Товар недели» — id из базы

export default function App() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cart, setCart] = useState([])
  // Пользователь из localStorage: вход переживает перезагрузку страницы
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user") || "null")
  )

  // Каталог: грузим при старте и при каждом изменении поиска
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")

    fetch(`${API_URL}/products?search=${encodeURIComponent(search)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сервера: " + res.status)
        return res.json()
      })
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.name === "AbortError") return
        setError("Не удалось загрузить товары. Запущен ли agromarket-server?")
        setLoading(false)
      })

    return () => controller.abort()
  }, [search])

  // Токен уже сохранён: проверяем на сервере, что он ещё действует
  useEffect(() => {
    if (!localStorage.getItem("token")) return
    apiFetch("/auth/me")
      .then((me) => {
        localStorage.setItem("user", JSON.stringify(me))
        setUser(me)
      })
      .catch(() => {})
  }, [])

  function handleLogin(user, token) {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    setUser(user)
  }

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  const addToCart = (product) => setCart((prev) => [...prev, product])

  return (
    <>
      <Header cartCount={cart.length} />

      <div className="auth-bar">
        {user ? (
          <>
            <span>Вы вошли как <b>{user.name}</b> ({user.role})</span>
            <button onClick={handleLogout}>Выйти</button>
          </>
        ) : (
          <LoginForm onLogin={handleLogin} />
        )}
      </div>

      <main className="page">
        {user?.role === "admin" && (
          <AddProductForm onAdded={(p) => setProducts((prev) => [...prev, p])} />
        )}

        <Catalog
          products={products}
          search={search}
          onSearch={setSearch}
          loading={loading}
          error={error}
          onAdd={addToCart}
          featuredId={FEATURED_ID}
        />

        <aside id="delivery" className="sidebar">
          <h3>Доставка</h3>
          <ul>
            <li>Астана — на следующий день</li>
            <li>Акмолинская область — 2–3 дня</li>
            <li>Бесплатно от 20 000 тг</li>
          </ul>
        </aside>

        <ContactForm />
      </main>

      <Footer />
    </>
  )
}
