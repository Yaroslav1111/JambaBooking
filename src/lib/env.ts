function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable ${name}`);
  }
  return value;
}

export const env = {
  clientEmail: requireEnv("GOOGLE_SHEETS_CLIENT_EMAIL"),
  privateKey: requireEnv("GOOGLE_SHEETS_PRIVATE_KEY").replace(/\\n/g, "\n"),
  spreadsheetId: requireEnv("GOOGLE_SHEETS_SPREADSHEET_ID"),
  seatsSheetName: requireEnv("GOOGLE_SHEETS_SEATS_SHEET_NAME"),
  bookingsSheetName: requireEnv("GOOGLE_SHEETS_BOOKINGS_SHEET_NAME"),
};
