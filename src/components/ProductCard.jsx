export default function ProductCard({ product, onAdd, featured = false }) {
  return (
    <article className={featured ? "card card--featured" : "card"}>
      {featured && <span className="badge">Товар недели</span>}
      <img src={product.image} alt={product.name} loading="lazy" />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p>{product.price} ₸</p>
        <button onClick={() => onAdd(product)}>В корзину</button>
      </div>
    </article>
  )
}
