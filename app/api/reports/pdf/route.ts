import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

// POST /api/reports/pdf — generar PDF A4 Landscape de la matriz
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { matrix } = body; // array de filas con name, group_name, y columnas

  if (!matrix || !Array.isArray(matrix)) {
    return NextResponse.json({ error: "matrix requerida (array de filas)" }, { status: 400 });
  }

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 30,
    info: {
      Title: "Tarifas Planes Integra",
      Author: "Integra Mutual",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Colores corporativos
  const azul = "#1e3c72";
  const verde = "#2ecc71";
  const grisClaro = "#f4f4f4";

  // Título
  doc.fontSize(14).font("Helvetica-Bold").fillColor(azul).text("INTEGRA — Matriz de Costos", { align: "center" });
  doc.fontSize(8).font("Helvetica").fillColor("#666").text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, { align: "center" });
  doc.moveDown(0.5);

  // Cabeceras de columna
  const cols = [
    { label: "Servicio", width: 180 },
    { label: "Activo\n(60% desc.)", width: 90 },
    { label: "Integra 90\n(Precio base)", width: 90 },
    { label: "Integra 180\n(30% desc.)", width: 90 },
    { label: "Integra 360\n(40% desc.)", width: 90 },
    { label: "Integra 360 Plus\n(A confirmar)", width: 100 },
  ];

  const startX = 30;
  let y = doc.y;

  // Dibujar cabeceras
  cols.forEach((col, i) => {
    const x = startX + cols.slice(0, i).reduce((s, c) => s + c.width, 0);
    doc.rect(x, y, col.width, 30).fill(azul);
    doc.fontSize(7).font("Helvetica-Bold").fillColor("#fff").text(col.label, x + 3, y + 5, {
      width: col.width - 6,
      align: "center",
      lineBreak: true,
    });
  });

  y += 30;

  // Agrupar por grupo
  const grouped: Record<string, typeof matrix> = {};
  matrix.forEach((row: { group_name: string }) => {
    const g = row.group_name || "Sin grupo";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(row);
  });

  // Dibujar filas
  Object.entries(grouped).forEach(([group, rows]) => {
    // Fila de grupo
    doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), 18).fill(verde);
    doc.fontSize(8).font("Helvetica-Bold").fillColor("#fff").text(group.toUpperCase(), startX + 5, y + 3);
    y += 18;

    rows.forEach((row: Record<string, unknown>, rowIdx: number) => {
      if (rowIdx % 2 === 0) {
        doc.rect(startX, y, cols.reduce((s, c) => s + c.width, 0), 18).fill(grisClaro);
      }

      const values = [
        row.name,
        row.activo != null ? `$${Number(row.activo).toFixed(2)}` : "—",
        row.integra_90 != null ? `$${Number(row.integra_90).toFixed(2)}` : "—",
        row.integra_180 != null ? `$${Number(row.integra_180).toFixed(2)}` : "—",
        row.integra_360 != null ? `$${Number(row.integra_360).toFixed(2)}` : "—",
        row.integra_360_plus != null ? `$${Number(row.integra_360_plus).toFixed(2)}` : "A confirmar",
      ];

      cols.forEach((col, i) => {
        const x = startX + cols.slice(0, i).reduce((s, c) => s + c.width, 0);
        doc.fontSize(7).font("Helvetica").fillColor(i === 5 && row.integra_360_plus == null ? "#aaa" : "#333").text(
          String(values[i]),
          x + 3,
          y + 4,
          { width: col.width - 6, align: i === 0 ? "left" : "right" }
        );
      });

      y += 18;

      // Nueva página si se pasa
      if (y > 540) {
        doc.addPage({ size: "A4", layout: "landscape", margin: 30 });
        y = 30;
      }
    });
  });

  // Footer
  doc.fontSize(7).font("Helvetica").fillColor("#999").text(
    "Documento generado por Integra Mutual — Confidencial",
    startX,
    doc.page.height - 30,
    { align: "center" }
  );

  doc.end();
  const pdfBuffer = await pdfPromise;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Tarifas_Planes_Integra.pdf"',
      "Cache-Control": "no-cache",
    },
  });
}
