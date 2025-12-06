import { NextResponse } from "next/server";
import { z } from "zod";
import { appendBooking, getSeatById, updateSeatStatus } from "@/lib/googleSheets";
import type { BookingRecord, ReservationResponse } from "@/types";

const ReserveSchema = z.object({
  seatId: z.string().min(1),
  name: z.string().min(1),
  surname: z.string().min(1),
  peopleCount: z.number().int().positive(),
  phone: z.string().min(1),
  captchaAnswer: z.string(),
  website: z.string().optional().default(""),
});

function generateReservationId() {
  const now = new Date();
  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");
  const counter = Math.floor(Math.random() * 9000) + 1000;
  return `RES-${date}-${counter.toString().padStart(4, "0")}`;
}

export async function POST(request: Request) {
  let payload: z.infer<typeof ReserveSchema>;
  try {
    const json = await request.json();
    const parsed = ReserveSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    payload = parsed.data;
  } catch (error) {
    console.error("Invalid JSON", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.captchaAnswer.trim() !== "5") {
    return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
  }

  if (payload.website && payload.website.trim().length > 0) {
    return NextResponse.json({ error: "Bot detected" }, { status: 400 });
  }

  try {
    const { seat, rowNumber, sheets } = await getSeatById(payload.seatId);

    if (!seat || !rowNumber) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    }

    if (seat.status !== "free") {
      return NextResponse.json({ error: "Seat not available" }, { status: 409 });
    }

    const reservationId = generateReservationId();
    const booking: BookingRecord = {
      reservationId,
      seatId: payload.seatId,
      name: payload.name,
      surname: payload.surname,
      peopleCount: payload.peopleCount,
      phone: payload.phone,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    await appendBooking(sheets, booking);
    await updateSeatStatus(sheets, rowNumber, "reserved");

    const response: ReservationResponse = {
      ok: true,
      reservationId,
      seatLabel: seat.label,
      peopleCount: payload.peopleCount,
      phone: payload.phone,
      price: seat.price,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to reserve seat", error);
    return NextResponse.json({ error: "Unable to reserve" }, { status: 500 });
  }
}
