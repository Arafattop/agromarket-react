import { useEffect, useState } from "react"
import Header from "./components/Header.jsx"
import Catalog from "./components/Catalog.jsx"
import ContactForm from "./components/ContactForm.jsx"
import Footer from "./components/Footer.jsx"
import { API_URL } from "./api.js"

const FEATURED_ID = 1 // «Товар недели» — id из db.json

export default function App() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cart, setCart] = useState([])

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

  const addToCart = (product) => setCart((prev) => [...prev, product])

  return (
    <>
      <Header cartCount={cart.length} />

      <main className="page">
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
