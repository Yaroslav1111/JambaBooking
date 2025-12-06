import BookingClient from "@/components/BookingClient";
import { getSeats } from "@/lib/googleSheets";

export const revalidate = 0;

export default async function HomePage() {
  const seats = await getSeats();

  return (
    <main>
      <div className="hero">
        <div>
          <div className="hero-highlight">Онлайн статус из Google Sheets</div>
          <h1>Бронирование столов</h1>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>
            Выберите свободный стол на схеме и оставьте контакты. После отправки
            автоматически откроется WhatsApp для подтверждения.
          </p>
        </div>
        <div className="section-card hero-actions" style={{ minWidth: 240 }}>
          <div style={{ fontWeight: 700 }}>Как это работает</div>
          <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
            Схема читает данные из листа <strong>Seats</strong>, заявки пишутся в
            <strong> Bookings</strong>. Стол блокируется сразу после успешной
            отправки формы.
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="legend-wrap">
          <div className="stage">Сцена</div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            Перетаскивать ничего не нужно — координаты x/y из Google Sheets
            выставляют места по сетке.
          </div>
        </div>
        <BookingClient initialSeats={seats} />
      </div>
    </main>
  );
}
