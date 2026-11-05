import { useState } from "react"
import { API_URL } from "../api.js"
import "./ContactForm.css"

export default function ContactForm() {
  const [status, setStatus] = useState(null) // { type: "ok" | "error", text }
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    const data = Object.fromEntries(new FormData(form))

    setSending(true)
    setStatus(null)
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        setStatus({ type: "error", text: result.error })
        return
      }
      setStatus({ type: "ok", text: `Заявка №${result.id} принята!` })
      form.reset()
    } catch {
      setStatus({ type: "error", text: "Сервер недоступен. Запущен ли agromarket-server?" })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="contact">
      <h2>Оптовая заявка</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Имя / организация *
          <input name="name" type="text" required />
        </label>
        <label>
          Email *
          <input name="email" type="email" required placeholder="farmer@mail.kz" />
        </label>
        <label>
          Телефон
          <input name="phone" type="tel" placeholder="+7 7XX XXX XX XX" />
        </label>
        <label>
          Объём, кг * (от 10)
          <input name="quantity" type="number" min="10" required />
        </label>
        <label>
          Желаемая дата доставки
          <input name="date" type="date" />
        </label>
        <label>
          Комментарий
          <textarea name="comment" rows="4" />
        </label>
        <button type="submit" disabled={sending}>
          {sending ? "Отправка…" : "Отправить заявку"}
        </button>
      </form>
      {status && <p className={status.type === "ok" ? "ok" : "error"}>{status.text}</p>}
    </section>
  )
}
