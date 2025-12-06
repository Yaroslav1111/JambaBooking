# JambaBooking Seat Reservation

This Next.js + TypeScript app renders a seating map and stores bookings in Google Sheets using a service account.

## Prerequisites
- Node.js 18+ and npm
- A Google Cloud service account with access to the target Spreadsheet
- Spreadsheet with two tabs: `Seats` and `Bookings`

## Environment setup
1. Copy env template:
   ```bash
   cp .env.example .env.local
   ```
2. Fill variables in `.env.local`:
   - `GOOGLE_SHEETS_CLIENT_EMAIL` – service account email.
   - `GOOGLE_SHEETS_PRIVATE_KEY` – paste the private key with newlines escaped (replace actual line breaks with `\n`).
   - `GOOGLE_SHEETS_SPREADSHEET_ID` – ID from the spreadsheet URL.
   - `GOOGLE_SHEETS_SEATS_SHEET_NAME` – tab name that holds seat data (e.g., `Seats`).
   - `GOOGLE_SHEETS_BOOKINGS_SHEET_NAME` – tab name for bookings (e.g., `Bookings`).
3. Ensure the service account email has edit access to the spreadsheet.

## Install & run
```bash
npm install
npm run dev
```
Visit http://localhost:3000.

## Spreadsheet expectations
### Seats sheet
Columns (row 1 header):
`seat_id`, `label`, `status`, `price`, `x`, `y`.

You can start from `seating-layout-template.csv` in the repo root: import it into your `Seats` tab (keep row 1 as headers). The coordinates are pre-arranged around a central stage to mirror the attached plan; modify labels/prices/x/y as you like, and statuses default to `free`.

### Bookings sheet
Columns (row 1 header):
`reservation_id`, `seat_id`, `name`, `surname`, `people_count`, `phone`, `timestamp`, `status`.

## Usage flow
1. Open the app to view the seat map with prices and statuses.
2. Click a free seat to open the reservation form.
3. Submit the form (captcha must be `5`, honeypot `website` stays empty).
4. On success, the seat is marked reserved, a confirmation message appears, and a WhatsApp window opens with pre-filled details.

## Notes
- Missing environment variables cause API handlers to fail fast with clear errors.
- Seat status is re-read on each reservation attempt to avoid double booking; non-free seats return HTTP 409.
- Adjust seat coordinates/prices directly in the `Seats` sheet to rearrange the map.
- Coordinates are normalized by unique X/Y ordering, so even large or negative values keep their relative placement without collapsing to the top-left corner.
