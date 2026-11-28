import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "../test/server.js"
import { CartProvider, useCart } from "../context/CartContext.jsx"
import CartPage from "../components/CartPage.jsx"

const honey = { id: 1, name: "Мёд гречишный", price: 3500 }

function Probe() {
  const { add, count, total } = useCart()
  return (
    <>
      <button type="button" onClick={() => add(honey)}>добавить</button>
      <p>кол-во {count}</p>
      <p>сумма {total}</p>
    </>
  )
}

describe("CartContext", () => {
  it("два добавления — одна позиция, количество 2, сохранено в localStorage", async () => {
    const user = userEvent.setup()
    render(<CartProvider><Probe /></CartProvider>)
    await user.click(screen.getByRole("button", { name: "добавить" }))
    await user.click(screen.getByRole("button", { name: "добавить" }))
    expect(screen.getByText("кол-во 2")).toBeInTheDocument()
    expect(screen.getByText("сумма 7000")).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([
      { productId: 1, name: "Мёд гречишный", price: 3500, quantity: 2 },
    ])
  })

  it("корзина переживает перезагрузку", () => {
    localStorage.setItem("cart", JSON.stringify([{ productId: 1, name: "Мёд гречишный", price: 3500, quantity: 3 }]))
    render(<CartProvider><Probe /></CartProvider>)
    expect(screen.getByText("кол-во 3")).toBeInTheDocument()
  })

  it("мусор в localStorage не ломает приложение", () => {
    localStorage.setItem("cart", "{не json")
    render(<CartProvider><Probe /></CartProvider>)
    expect(screen.getByText("кол-во 0")).toBeInTheDocument()
  })
})

function renderCart({ loggedIn = true, items } = {}) {
  localStorage.setItem("cart", JSON.stringify(items ?? [
    { productId: 1, name: "Мёд гречишный", price: 3500, quantity: 2 },
    { productId: 2, name: "Картофель молодой", price: 250, quantity: 4 },
  ]))
  if (loggedIn) localStorage.setItem("token", "test-token")
  return render(<CartProvider><CartPage onBack={() => {}} /></CartProvider>)
}

describe("CartPage", () => {
  it("пустая корзина — сообщение", () => {
    renderCart({ items: [] })
    expect(screen.getByText(/корзина пуста/i)).toBeInTheDocument()
  })

  it("показывает итог: 2×3500 + 4×250 = 8000", () => {
    renderCart()
    expect(screen.getByTestId("cart-total")).toHaveTextContent("8 000")
  })

  it("«+» и «−» меняют количество и пересчитывают итог", async () => {
    const user = userEvent.setup()
    renderCart()
    await user.click(screen.getByRole("button", { name: "Больше: Картофель молодой" }))
    expect(screen.getByTestId("cart-total")).toHaveTextContent("8 250")
    await user.click(screen.getByRole("button", { name: "Меньше: Мёд гречишный" }))
    expect(screen.getByTestId("cart-total")).toHaveTextContent("4 750")
    expect(screen.getByRole("button", { name: "Меньше: Мёд гречишный" })).toBeDisabled()
  })

  it("успешный заказ: в запросе нет цен, корзина очищается, показан номер", async () => {
    let sent
    server.use(http.post("*/api/shop-orders", async ({ request }) => {
      sent = await request.json()
      return HttpResponse.json({ id: 42, status: "new", total: 8000 }, { status: 201 })
    }))
    const user = userEvent.setup()
    renderCart()
    await user.type(screen.getByLabelText(/адрес доставки/i), "Астана, ул. Женис, 62")
    await user.click(screen.getByRole("button", { name: /оформить заказ/i }))
    expect(await screen.findByText("Заказ №42 оформлен")).toBeInTheDocument()
    expect(sent.items).toEqual([{ productId: 1, quantity: 2 }, { productId: 2, quantity: 4 }])
    expect(sent.items[0].price).toBeUndefined()
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([])
  })

  it("товара не хватило (409) — сообщение по позициям, корзина не очищается", async () => {
    server.use(http.post("*/api/shop-orders", () => HttpResponse.json(
      { error: "Недостаточно товара", details: [{ productId: 2, name: "Картофель молодой", available: 1 }] },
      { status: 409 })))
    const user = userEvent.setup()
    renderCart()
    await user.type(screen.getByLabelText(/адрес доставки/i), "Астана, ул. Женис, 62")
    await user.click(screen.getByRole("button", { name: /оформить заказ/i }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Недостаточно товара")
    expect(alert).toHaveTextContent("Картофель молодой: в наличии 1 шт.")
    expect(JSON.parse(localStorage.getItem("cart"))).toHaveLength(2)
  })

  it("без входа вместо формы — подсказка", () => {
    renderCart({ loggedIn: false })
    expect(screen.queryByRole("button", { name: /оформить заказ/i })).not.toBeInTheDocument()
    expect(screen.getByText(/войдите в аккаунт/i)).toBeInTheDocument()
  })
})
