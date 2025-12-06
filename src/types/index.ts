export type SeatStatus = "free" | "pending" | "reserved" | "paid";

export interface Seat {
  id: string;
  label: string;
  status: SeatStatus;
  price: number;
  x?: number;
  y?: number;
}

export interface ReservationRequest {
  seatId: string;
  name: string;
  surname: string;
  peopleCount: number;
  phone: string;
  captchaAnswer: string;
  website?: string;
}

export interface ReservationResponse {
  ok: boolean;
  reservationId: string;
  seatLabel: string;
  peopleCount: number;
  phone: string;
  price: number;
}

export interface BookingRecord {
  reservationId: string;
  seatId: string;
  name: string;
  surname: string;
  peopleCount: number;
  phone: string;
  timestamp: string;
  status: SeatStatus;
}
