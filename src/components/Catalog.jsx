import ProductCard from "./ProductCard.jsx"

export default function Catalog({ products, search, onSearch, loading, error, onAdd, featuredId }) {
  return (
    <section id="catalog" className="catalog">
      <div className="catalog-toolbar">
        <h2>Каталог</h2>
        <input
          className="search"
          type="search"
          placeholder="Поиск товара…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {loading && <p>Загрузка…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && products.length === 0 && <p>Ничего не найдено</p>}

      {!error && (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={onAdd}
              featured={p.id === featuredId}
            />
          ))}
        </div>
      )}
    </section>
  )
}
