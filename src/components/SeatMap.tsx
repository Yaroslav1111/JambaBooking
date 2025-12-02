"use client";

import SeatPicker, { Seat as SeatPickerSeat } from "react-seat-picker";
import "react-seat-picker/dist/react-seat-picker.css";
import { useMemo } from "react";
import type { Seat } from "@/types";

interface SeatMapProps {
  seats: Seat[];
  onSelect: (seat: Seat) => void;
}

function buildRows(seats: Seat[]): SeatPickerSeat[][] {
  const hasCoordinates = seats.some((s) => s.y !== undefined || s.x !== undefined);
  if (hasCoordinates) {
    const grouped: Record<number, Seat[]> = {};
    seats.forEach((seat) => {
      const key = seat.y ?? 0;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(seat);
    });

    const yKeys = Object.keys(grouped)
      .map((v) => Number(v))
      .sort((a, b) => a - b);

    return yKeys.map((y) =>
      grouped[y]
        .sort((a, b) => (a.x ?? 0) - (b.x ?? 0))
        .map((seat) => ({
          id: seat.id,
          number: `${seat.label} • ${seat.price}₺`,
          isReserved: seat.status !== "free",
          tooltip: `${seat.price}₺`,
        }))
    );
  }

  // fallback: chunk by 4
  const chunkSize = 4;
  const rows: SeatPickerSeat[][] = [];
  for (let i = 0; i < seats.length; i += chunkSize) {
    rows.push(
      seats.slice(i, i + chunkSize).map((seat) => ({
        id: seat.id,
        number: `${seat.label} • ${seat.price}₺`,
        isReserved: seat.status !== "free",
        tooltip: `${seat.price}₺`,
      }))
    );
  }
  return rows;
}

export default function SeatMap({ seats, onSelect }: SeatMapProps) {
  const rows = useMemo(() => buildRows(seats), [seats]);

  return (
    <div>
      <SeatPicker
        rows={rows}
        maxReservableSeats={1}
        alpha
        selectedByDefault={null}
        addSeatCallback={({ row, number, id }, addCb) => {
          const seat = seats.find((item) => item.id === id);
          if (!seat || seat.status !== "free") return;
          addCb(row, number, id, "selected");
          onSelect(seat);
        }}
        removeSeatCallback={({ row, number }, removeCb) => {
          removeCb(row, number);
        }}
        tooltipProps={{ multiline: true }}
      />
      <div className="status-legend">
        <span className="status-pill">
          <span className="status-dot" style={{ background: "#22d3ee" }} /> Свободно
        </span>
        <span className="status-pill">
          <span className="status-dot" style={{ background: "#f87171" }} /> Занято
        </span>
      </div>
    </div>
  );
}
