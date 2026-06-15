import { NextRequest, NextResponse } from "next/server";

// POST /api/reports/pdf — genera HTML imprimible A4 Landscape
// El frontend usa window.print() para guardar como PDF
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { matrix } = body;

  if (!matrix || !Array.isArray(matrix)) {
    return NextResponse.json({ error: "matrix requerida" }, { status: 400 });
  }

  const grouped: Record<string, typeof matrix> = {};
  matrix.forEach((row: { group_name: string }) => {
    const g = row.group_name || "Sin grupo";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(row);
  });

  const format = (v: number | null) => v != null ? `$${v.toFixed(2)}` : "—";

  const rowsHtml = Object.entries(grouped)
    .map(
      ([group, rows]) => `
      <tr><td colspan="6" class="group">${group.toUpperCase()}</td></tr>
      ${rows.map((r: Record<string, unknown>) => `
        <tr>
          <td class="name">${r.name}</td>
          <td class="price">${format(r.activo as number | null)}</td>
          <td class="price base">${format(r.integra_90 as number | null)}</td>
          <td class="price">${format(r.integra_180 as number | null)}</td>
          <td class="price">${format(r.integra_360 as number | null)}</td>
          <td class="price future">${r.integra_360_plus != null ? format(r.integra_360_plus as number | null) : "A confirmar"}</td>
        </tr>
      `).join("")}
    `
    )
    .join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Tarifas Planes Integra</title>
<style>
  @page { size: A4 landscape; margin: 15mm; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
  h1 { color: #1e3c72; text-align: center; font-size: 16px; margin-bottom: 4px; }
  .date { text-align: center; color: #666; font-size: 10px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1e3c72; color: #fff; padding: 6px 8px; font-size: 10px; text-align: center; }
  th small { display: block; font-weight: normal; opacity: 0.8; font-size: 8px; }
  td { padding: 5px 8px; border-bottom: 1px solid #eee; }
  td.name { text-align: left; font-weight: 500; }
  td.price { text-align: right; }
  td.base { font-weight: bold; color: #1e3c72; }
  td.future { color: #999; }
  .group { background: #2ecc71; color: #fff; font-weight: bold; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
  .footer { text-align: center; color: #999; font-size: 9px; margin-top: 15px; }
</style></head><body>
<h1>INTEGRA — Matriz de Costos</h1>
<p class="date">Fecha: ${new Date().toLocaleDateString("es-AR")}</p>
<table>
<thead><tr>
  <th>Servicio</th>
  <th>Activo<br><small>60% desc.</small></th>
  <th>Integra 90<br><small>Precio base</small></th>
  <th>Integra 180<br><small>30% desc.</small></th>
  <th>Integra 360<br><small>40% desc.</small></th>
  <th>Integra 360 Plus<br><small>A confirmar</small></th>
</tr></thead>
<tbody>${rowsHtml}</tbody></table>
<p class="footer">Documento generado por Integra Mutual — Confidencial</p>
</body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
