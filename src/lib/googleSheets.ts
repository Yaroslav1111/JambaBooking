import { google, sheets_v4 } from "googleapis";
import { env } from "./env";
import type { BookingRecord, Seat, SeatStatus } from "@/types";

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

function createSheetsClient(): sheets_v4.Sheets {
  const auth = new google.auth.JWT(env.clientEmail, undefined, env.privateKey, scopes);
  return google.sheets({ version: "v4", auth });
}

async function fetchSeatRows(sheets: sheets_v4.Sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.spreadsheetId,
    range: `${env.seatsSheetName}!A2:F`,
  });
  const values = res.data.values ?? [];
  return values as string[][];
}

function mapRowToSeat(row: string[]): Seat {
  const [id, label, status, price, x, y] = row;
  return {
    id,
    label,
    status: (status as SeatStatus) ?? "free",
    price: Number(price ?? 0),
    x: x ? Number(x) : undefined,
    y: y ? Number(y) : undefined,
  };
}

export async function getSeats(): Promise<Seat[]> {
  const sheets = createSheetsClient();
  const rows = await fetchSeatRows(sheets);
  return rows
    .filter((row) => row[0])
    .map(mapRowToSeat);
}

export async function getSeatById(seatId: string) {
  const sheets = createSheetsClient();
  const rows = await fetchSeatRows(sheets);
  const index = rows.findIndex((row) => row[0] === seatId);
  const seat = index >= 0 ? mapRowToSeat(rows[index]) : null;
  const rowNumber = index >= 0 ? index + 2 : null; // +2 because header row
  return { seat, rowNumber, sheets } as const;
}

export async function updateSeatStatus(
  sheets: sheets_v4.Sheets,
  rowNumber: number,
  status: SeatStatus
) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.spreadsheetId,
    range: `${env.seatsSheetName}!C${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [[status]] },
  });
}

export async function appendBooking(
  sheets: sheets_v4.Sheets,
  booking: BookingRecord
) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: env.spreadsheetId,
    range: `${env.bookingsSheetName}!A:H`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          booking.reservationId,
          booking.seatId,
          booking.name,
          booking.surname,
          booking.peopleCount,
          booking.phone,
          booking.timestamp,
          booking.status,
        ],
      ],
    },
  });
}
