import { NextResponse } from "next/server";
import { getSeats } from "@/lib/googleSheets";

export const revalidate = 0;

export async function GET() {
  try {
    const seats = await getSeats();
    return NextResponse.json(seats);
  } catch (error) {
    console.error("Failed to fetch seats", error);
    return NextResponse.json({ error: "Failed to load seats" }, { status: 500 });
  }
}
