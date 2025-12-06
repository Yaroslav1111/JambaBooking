"use client";

import { useMemo, useState } from "react";
import SeatMap from "./SeatMap";
import ReservationForm from "./ReservationForm";
import type { ReservationResponse, Seat } from "@/types";

interface BookingClientProps {
  initialSeats: Seat[];
}

const WHATSAPP_NUMBER = "905488510810";

function redirectToWhatsApp(data: ReservationResponse) {
  const msg = `
Здравствуйте, Яна!
Сделали резервацию №${data.reservationId}
Стол: ${data.seatLabel}
Кол-во человек: ${data.peopleCount}
Телефон: ${data.phone}
`.trim();

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  window.location.href = waUrl;
}

export default function BookingClient({ initialSeats }: BookingClientProps) {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedSeats = useMemo(
    () =>
      [...seats].sort((a, b) => {
        const ay = a.y ?? 0;
        const by = b.y ?? 0;
        if (ay === by) return (a.x ?? 0) - (b.x ?? 0);
        return ay - by;
      }),
    [seats]
  );

  const handleSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setError(null);
  };

  const handleSuccess = (response: ReservationResponse) => {
    if (!selectedSeat) return;
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === selectedSeat.id ? { ...seat, status: "reserved" } : seat
      )
    );
    setSelectedSeat(null);
    const message = `Спасибо! Ваша резервация №${response.reservationId} создана.`;
    setSuccess(message);
    setError(null);
    redirectToWhatsApp(response);
  };

  const handleError = (message: string) => {
    setError(message);
    setSuccess(null);
  };

  return (
    <div>
      {success && <div className="success-banner">{success}</div>}
      {error && <div className="error-banner">{error}</div>}
      <SeatMap seats={sortedSeats} onSelect={handleSelect} />

      {selectedSeat && (
        <ReservationForm
          seat={selectedSeat}
          onClose={() => setSelectedSeat(null)}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}
