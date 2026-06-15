import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Integra — Mutual de Salud",
  description: "Plataforma de gestión para la Mutual Integra.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
