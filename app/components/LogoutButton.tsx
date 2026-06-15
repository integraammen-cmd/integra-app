"use client";

import { usePathname } from "next/navigation";

export default function LogoutButton() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <div className="fixed top-3 right-3 z-50">
      <form action="/api/auth/logout" method="POST">
        <button className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors shadow-lg">
          Salir
        </button>
      </form>
    </div>
  );
}
