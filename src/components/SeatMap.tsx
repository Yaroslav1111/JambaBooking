"use client";

import SeatPicker, { Seat as SeatPickerSeat } from "react-seat-picker";
import "react-seat-picker/dist/react-seat-picker.css";
import { useMemo } from "react";
import type { Seat, SeatStatus } from "@/types";

interface SeatMapProps {
  seats: Seat[];
  onSelect: (seat: Seat) => void;
}

function normalizePositions(values: number[]) {
  const rounded = values.map((v) => Math.round(v));
  const uniques = Array.from(new Set(rounded)).sort((a, b) => a - b);
  return uniques;
}

function buildRows(seats: Seat[]): (SeatPickerSeat | null)[][] {
  const hasCoordinates = seats.some(
    (s) => s.y !== undefined && s.x !== undefined
  );
  if (hasCoordinates) {
    const seatsWithCoords = seats.filter(
      (s): s is Seat & { x: number; y: number } =>
        typeof s.x === "number" && typeof s.y === "number"
    );

    const xPositions = normalizePositions(seatsWithCoords.map((s) => s.x));
    const yPositions = normalizePositions(seatsWithCoords.map((s) => s.y));

    const grouped: Record<number, Seat[]> = {};
    seatsWithCoords.forEach((seat) => {
      const yIndex = yPositions.indexOf(Math.round(seat.y));
      if (!grouped[yIndex]) grouped[yIndex] = [];
      grouped[yIndex].push(seat);
    });

    const yKeys = Object.keys(grouped)
      .map((v) => Number(v))
      .sort((a, b) => a - b);

    return yKeys.map((yKey) => {
      const rowSeats: (SeatPickerSeat | null)[] = Array(xPositions.length).fill(
        null
      );
      grouped[yKey]
        .sort(
          (a, b) =>
            xPositions.indexOf(Math.round(a.x)) -
            xPositions.indexOf(Math.round(b.x))
        )
        .forEach((seat) => {
          const xIndex = xPositions.indexOf(Math.round(seat.x));
          rowSeats[xIndex] = {
            id: seat.id,
            number: seat.label,
            isReserved: seat.status !== "free",
            tooltip: `${seat.price}₺`,
            status: seat.status,
            priceTag: `${seat.price}₺`,
          } as SeatPickerSeat & { status: SeatStatus; priceTag: string };
        });
      return rowSeats;
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
