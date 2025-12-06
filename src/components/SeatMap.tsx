"use client";

import SeatPicker, { Seat as SeatPickerSeat } from "react-seat-picker";
import "react-seat-picker/dist/react-seat-picker.css";
import { useMemo } from "react";
import type { Seat, SeatStatus } from "@/types";

interface SeatMapProps {
  seats: Seat[];
  onSelect: (seat: Seat) => void;
}

function buildRows(seats: Seat[]): SeatPickerSeat[][] {
  const hasCoordinates = seats.some(
    (s) => s.y !== undefined && s.x !== undefined
  );
  if (hasCoordinates) {
    const grouped: Record<number, Seat[]> = {};
    seats.forEach((seat) => {
      const rowKey = seat.y ?? 0;
      if (!grouped[rowKey]) grouped[rowKey] = [];
      grouped[rowKey].push(seat);
    });

    const yKeys = Object.keys(grouped)
      .map((v) => Number(v))
      .sort((a, b) => a - b);

    const maxX = seats.reduce((acc, seat) => Math.max(acc, seat.x ?? 0), 0);

    return yKeys.map((y) => {
      const rowSeats: (SeatPickerSeat | null)[] = Array(maxX + 1).fill(null);
      grouped[y]
        .sort((a, b) => (a.x ?? 0) - (b.x ?? 0))
        .forEach((seat) => {
          const xIndex = Math.max(0, Math.round(seat.x ?? 0));
          rowSeats[xIndex] = {
            id: seat.id,
            number: seat.label,
            isReserved: seat.status !== "free",
            tooltip: `${seat.price}₺`,
            status: seat.status,
            priceTag: `${seat.price}₺`,
          } as SeatPickerSeat & { status: SeatStatus; priceTag: string };
        });
      return rowSeats as SeatPickerSeat[];
    });
  }

  // fallback: chunk by 4
  const chunkSize = 4;
  const rows: SeatPickerSeat[][] = [];
  for (let i = 0; i < seats.length; i += chunkSize) {
    rows.push(
      seats.slice(i, i + chunkSize).map((seat) => ({
        id: seat.id,
        number: seat.label,
        isReserved: seat.status !== "free",
        tooltip: `${seat.price}₺`,
        status: seat.status,
        priceTag: `${seat.price}₺`,
      }))
    );
  }
  return rows;
}

export default function SeatMap({ seats, onSelect }: SeatMapProps) {
  const rows = useMemo(() => buildRows(seats), [seats]);

  return (
    <div className="seat-map">
      <SeatPicker
        rows={rows}
        maxReservableSeats={1}
        alpha
        selectedByDefault={null}
        renderSeat={({ seat, selected }) => {
          const status = (seat as SeatPickerSeat & { status?: SeatStatus }).status;
          const priceTag = (seat as SeatPickerSeat & { priceTag?: string }).priceTag;
          const isBlocked = status && status !== "free";
          return (
            <div
              className={`seat-tile ${isBlocked ? "seat-disabled" : ""} ${
                selected ? "seat-selected" : ""
              }`}
            >
              <div className="seat-label">{seat.number}</div>
              <div className="seat-price">{priceTag}</div>
              {status && status !== "free" && (
                <span className="seat-chip">{status}</span>
              )}
            </div>
          );
        }}
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
