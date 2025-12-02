"use client";

import { useState } from "react";
import type { ReservationResponse, Seat } from "@/types";

interface ReservationFormProps {
  seat: Seat;
  onClose: () => void;
  onSuccess: (response: ReservationResponse) => void;
  onError: (message: string) => void;
}

export default function ReservationForm({ seat, onClose, onSuccess, onError }: ReservationFormProps) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [phone, setPhone] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatId: seat.id,
          name,
          surname,
          peopleCount: Number(peopleCount),
          phone,
          captchaAnswer,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data?.error || "Не удалось создать бронь";
        setLocalError(message);
        onError(message);
        return;
      }

      onSuccess(data as ReservationResponse);
    } catch (error) {
      console.error(error);
      const message = "Сервер недоступен, попробуйте позже";
      setLocalError(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="close-btn" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <h3 style={{ margin: "0 0 10px" }}>Стол: {seat.label}</h3>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>Цена: {seat.price}₺</p>

        {localError && <div className="error-banner">{localError}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Имя
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Фамилия
            <input value={surname} onChange={(e) => setSurname(e.target.value)} required />
          </label>
          <label>
            Сколько человек придёт
            <input
              type="number"
              min={1}
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value, 10))}
              required
            />
          </label>
          <label>
            Номер телефона с активным WhatsApp
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label>
            Сколько будет 2 + 3?
            <input value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} required />
          </label>
          <label className="hidden-field">
            Website
            <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Отправляем..." : "Забронировать"}
          </button>
        </form>
      </div>
    </div>
  );
}
