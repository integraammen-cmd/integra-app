"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

type MatrixRow = {
  grupo: string;
  servicio: string;
  activo: number | null;
  integra_90: number | null;
  integra_180: number | null;
  integra_360: number | null;
  integra_360_plus: number | null;
};

function buildPDF(matrix: MatrixRow[]): Blob {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = new Date().toLocaleDateString("es-AR");

  // Títulos
  doc.setFontSize(14);
  doc.setTextColor(30, 60, 114);
  doc.text("INTEGRA MUTUAL — Tarifas por Plan", 10, 15);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Actualizado: ${today}`, 10, 22);

  // Columnas
  const cols = [
    { header: "Grupo", dataKey: "grupo" },
    { header: "Servicio", dataKey: "servicio" },
    { header: "Activo", dataKey: "activo" },
    { header: "Integra 90", dataKey: "integra_90" },
    { header: "Integra 180", dataKey: "integra_180" },
    { header: "Integra 360", dataKey: "integra_360" },
    { header: "360 Plus", dataKey: "integra_360_plus" },
  ];

  // Encabezados de tabla
  doc.setFillColor(30, 60, 114);
  doc.setTextColor(255);
  doc.setFontSize(8);
  let x = 10;
  const colW = [35, 60, 22, 22, 22, 22, 22];
  cols.forEach((c, i) => {
    doc.rect(x, 27, colW[i], 7, "F");
    doc.text(c.header, x + 1, 32);
    x += colW[i];
  });

  // Filas
  doc.setTextColor(40);
  doc.setFontSize(7);
  let y = 37;
  matrix.forEach((row, ri) => {
    if (y > 190) {
      doc.addPage();
      y = 10;
    }
    // Fondo alternado
    if (ri % 2 === 0) {
      doc.setFillColor(245, 245, 250);
      doc.rect(10, y - 4, colW.reduce((a, b) => a + b, 0), 5, "F");
    }
    x = 10;
    const vals = [row.grupo, row.servicio, row.activo != null ? `$${row.activo.toFixed(2)}` : "—", row.integra_90 != null ? `$${row.integra_90.toFixed(2)}` : "—", row.integra_180 != null ? `$${row.integra_180.toFixed(2)}` : "—", row.integra_360 != null ? `$${row.integra_360.toFixed(2)}` : "—", row.integra_360_plus != null ? `$${row.integra_360_plus.toFixed(2)}` : "Pendiente"];
    vals.forEach((v, i) => {
      doc.text(String(v).substring(0, i === 1 ? 40 : 20), x + 1, y);
      x += colW[i];
    });
    y += 5.5;
  });

  const pdfBytes = doc.output("blob");
  return pdfBytes;
}

export default function PdfShareButton({ matrix }: { matrix: unknown[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("es-AR");

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const pdfBlob = buildPDF(matrix as MatrixRow[]);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Tarifas_Integra_${today.replace(/\//g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
    setLoading(false);
  }

  async function handleWhatsApp() {
    setLoading(true);
    setError(null);
    try {
      const pdfBlob = buildPDF(matrix as MatrixRow[]);
      const file = new File([pdfBlob], `Tarifas_Integra_${today.replace(/\//g, "-")}.pdf`, { type: "application/pdf" });

      // Web Share API: abre WhatsApp directamente en mobile
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Tarifas Planes Integra",
          text: `Tarifas actualizadas al ${today}`,
          files: [file],
        });
      } else {
        // Fallback desktop: descargar PDF + abrir WhatsApp Web
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Tarifas_Integra_${today.replace(/\//g, "-")}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Tarifas Planes Integra — ${today}\nSe descargó el PDF. Compartilo manualmente desde tu dispositivo.`)}`,
          "_blank"
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
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
        onClick={handleWhatsApp}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
      >
        {loading ? "⏳" : "💬"} WhatsApp
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
