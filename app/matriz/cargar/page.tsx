// [FIX v0.2.1]: Cargar Servicio wrapper — Integra Mutual brand identity
"use client";

import CostMatrixForm from "../../components/CostMatrixForm";
import { useRouter } from "next/navigation";

export default function CargarServicioPage() {
  const router = useRouter();

  return (
    <div
      className="page-container"
      style={{ background: "var(--bg-base)", minHeight: "100vh" }}
    >
      <button
        onClick={() => router.push("/matriz")}
        className="mb-4 text-sm inline-flex items-center gap-1 hover:underline transition-opacity hover:opacity-80"
        style={{ color: "var(--accent-green)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver a la matriz
      </button>
      <CostMatrixForm onSaved={() => {}} />
    </div>
  );
}
