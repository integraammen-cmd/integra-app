"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "INICIO", icon: "🏠" },
  { href: "/agenda", label: "CALENDARIO", icon: "📅" },
  { href: "/briefing", label: "IA CHAT", icon: "🤖" },
  { href: "/matriz", label: "INFORMES", icon: "📊" },
  { href: "/matriz/cargar", label: "AJUSTES", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-[#0f1117] safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
              pathname === item.href
                ? "text-[#1e3c72]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
