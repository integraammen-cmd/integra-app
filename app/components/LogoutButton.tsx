"use client";

import { usePathname } from "next/navigation";

export default function LogoutButton() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <div className="fixed top-3 right-3 z-50">
      <form action="/api/auth/logout" method="POST">
        <button className="rounded-full bg-zinc-800 hover:bg-red-900/50 px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors border border-zinc-700">
          Salir
        </button>
      </form>
    </div>
  );
}
