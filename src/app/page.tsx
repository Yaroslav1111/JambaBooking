import BookingClient from "@/components/BookingClient";
import { getSeats } from "@/lib/googleSheets";

export const revalidate = 0;

export default async function HomePage() {
  const seats = await getSeats();

  return (
    <main>
      <header>
        <div>
          <h1>Бронирование столов</h1>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>
            Выберите свободный стол на схеме и оставьте контакты. После отправки
            автоматически откроется WhatsApp для подтверждения.
          </p>
        </div>
        <div className="section-card" style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Справка</div>
          <div style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5 }}>
            Статусы обновляются из Google Sheets. При успешном бронировании стол
            сразу станет недоступным для других.
          </div>
        </div>
      </header>

      <div className="section-card">
        <div className="stage">Сцена</div>
        <BookingClient initialSeats={seats} />
      </div>
    </main>
  );
}
