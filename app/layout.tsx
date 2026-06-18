// [REFACTOR v0.2.0]: Poppins font + PWA manifest link
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Integra — Mutual de Salud",
  description: "Plataforma de gestión para la Mutual Integra.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // [FIX v0.2.1]: theme-color actualizado al nuevo bg-base
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0A0F2E" />
      </head>
      <body className={`${poppins.variable} antialiased min-h-screen`}>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
