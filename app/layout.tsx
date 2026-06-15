import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import LogoutButton from "./components/LogoutButton";

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
      <body className="antialiased bg-[#0f1117] text-white min-h-screen">
        <LogoutButton />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
