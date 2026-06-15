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

      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        // Disparar impresión (el usuario elige "Guardar como PDF")
        setTimeout(() => win.print(), 500);
      } else {
        // Fallback: descargar como HTML
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Tarifas_Planes_Integra.html";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }

    setLoading(false);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "⏳" : "📄"} Exportar PDF
      </button>
      <button
        onClick={() => {
          const text = encodeURIComponent("Tarifas Planes Integra — " + new Date().toLocaleDateString("es-AR"));
          window.open(`https://wa.me/?text=${text}`, "_blank");
        }}
        className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
      >
        💬 WhatsApp
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
