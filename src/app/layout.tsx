import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jamba Booking",
  description: "Онлайн бронирование столов и мест на события.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
