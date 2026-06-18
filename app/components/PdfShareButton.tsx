// [FIX v0.2.1]: PdfShareButton — corregido campos undefined + WhatsApp real PDF
"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

/** Estructura real que viene de la API /api/matrix */
type MatrixRow = {
  id: string;
  name: string;
  group_name: string;
  activo: number | null;
  integra_90: number | null;
  integra_180: number | null;
  integra_360: number | null;
  integra_360_plus: number | null;
};

function buildPDF(matrix: MatrixRow[]): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = new Date().toLocaleDateString("es-AR");

  doc.setFontSize(14);
  // [FIX v0.2.2]: RGB explícito para evitar texto invisible
  doc.setTextColor(10, 15, 46);
  doc.text("INTEGRA MUTUAL — Tarifas por Plan", 10, 15);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Actualizado: ${today}`, 10, 22);

  const colW = [35, 60, 22, 22, 22, 22, 22];

  doc.setFillColor(10, 15, 46);
  // [FIX v0.2.2]: RGB explícito — texto blanco sobre fondo oscuro
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  let x = 10;
  const headers = ["Grupo", "Servicio", "Activo", "Integra 90", "Integra 180", "Integra 360", "360 Plus"];
  headers.forEach((h, i) => {
    doc.rect(x, 27, colW[i], 7, "F");
    doc.text(h, x + 1, 32);
    x += colW[i];
  });

  // [FIX v0.2.2]: RGB explícito — texto oscuro sobre fondo claro
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(7);
  let y = 37;
  matrix.forEach((row, ri) => {
    if (y > 190) {
      doc.addPage();
      y = 10;
    }
    if (ri % 2 === 0) {
      doc.setFillColor(240, 242, 250);
      doc.rect(10, y - 4, colW.reduce((a, b) => a + b, 0), 5, "F");
    }
    x = 10;
    // [FIX v0.2.1]: usar name y group_name, con fallback ??
    const vals = [
      row.group_name ?? "Sin grupo",
      row.name ?? "Sin nombre",
      row.activo != null ? `$${row.activo.toFixed(2)}` : "—",
      row.integra_90 != null ? `$${row.integra_90.toFixed(2)}` : "—",
      row.integra_180 != null ? `$${row.integra_180.toFixed(2)}` : "—",
      row.integra_360 != null ? `$${row.integra_360.toFixed(2)}` : "—",
      row.integra_360_plus != null ? `$${row.integra_360_plus.toFixed(2)}` : "Pendiente",
    ];
    vals.forEach((v, i) => {
      doc.text(String(v).substring(0, i === 1 ? 40 : 20), x + 1, y);
      x += colW[i];
    });
    y += 5.5;
  });

  return doc;
}

export default function PdfShareButton({ matrix }: { matrix: unknown[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toLocaleDateString("es-AR");

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const doc = buildPDF(matrix as MatrixRow[]);
      const pdfBlob = doc.output("blob");
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

  // [FIX v0.2.1]: WhatsApp — compartir PDF real via Web Share API
  async function handleWhatsApp() {
    setLoading(true);
    setError(null);
    try {
      const doc = buildPDF(matrix as MatrixRow[]);
      const pdfBlob = doc.output("blob");
      const pdfFile = new File(
        [pdfBlob],
        "integra-tarifas.pdf",
        { type: "application/pdf" }
      );

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: "Integra Mutual — Tarifas por Plan",
          text: "Matriz de costos actualizada",
        });
      } else {
        // Fallback: abrir WhatsApp Web con texto
        const texto = encodeURIComponent(
          "Adjunto la matriz de costos de Integra Mutual. " +
          "Actualizado: " + today
        );
        window.open("https://wa.me/?text=" + texto, "_blank");
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
        className="btn-primary text-sm"
        style={{ padding: "8px 16px" }}
      >
        {loading ? "⏳" : "📄"} Exportar PDF
      </button>
      <button
        onClick={handleWhatsApp}
        disabled={loading}
        className="btn-secondary text-sm"
        style={{ padding: "8px 16px" }}
      >
        {loading ? "⏳" : "💬"} WhatsApp
      </button>
      {error && <p className="text-xs" style={{ color: "var(--state-error)" }}>{error}</p>}
    </div>
  );
}
