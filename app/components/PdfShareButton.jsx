"use client";

import { useState } from "react";

export default function PdfShareButton({ matrix }: { matrix: unknown[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix }),
      });

      if (!res.ok) {
        setError("Error al generar el PDF");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const file = new File([blob], "Tarifas_Planes_Integra.pdf", { type: "application/pdf" });

      // Intentar Web Share API (WhatsApp, email, etc.)
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Tarifas Planes Integra",
          files: [file],
        });
      } else {
        // Fallback: descarga directa
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Tarifas_Planes_Integra.pdf";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }

    setLoading(false);
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "⏳ Generando..." : "📄 Exportar PDF"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
