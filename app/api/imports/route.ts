// [FEATURE v0.3.0]: API para importaciones y usage_records
import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/imports — listar imports
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("imports")
    .select("*")
    .order("fecha_import", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/imports — crear import con usage_records
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const { archivo_nombre, registros } = body as {
    archivo_nombre: string;
    registros: Array<{
      socio_codigo: string;
      socio_nombre: string;
      tipo_socio: string;
      servicio_nombre: string;
      service_id: string | null;
      monto_cobrado: number;
      fecha_uso: string;
    }>;
  };

  if (!archivo_nombre || !registros?.length) {
    return NextResponse.json({ error: "archivo_nombre y registros requeridos" }, { status: 400 });
  }

  // 1. Crear import
  const { data: importData, error: importErr } = await supabase
    .from("imports")
    .insert({
      archivo_nombre,
      total_registros: registros.length,
      registros_validos: registros.length,
      registros_error: 0,
      estado: "completo",
    })
    .select()
    .single();

  if (importErr) {
    return NextResponse.json({ error: importErr.message }, { status: 500 });
  }

  // 2. Insertar usage_records
  const usageRows = registros.map((r) => ({
    import_id: (importData as { id: string }).id,
    socio_codigo: r.socio_codigo || null,
    socio_nombre: r.socio_nombre,
    tipo_socio: r.tipo_socio,
    servicio_nombre: r.servicio_nombre,
    service_id: r.service_id || null,
    monto_cobrado: r.monto_cobrado || 0,
    fecha_uso: r.fecha_uso,
  }));

  const { error: usageErr } = await supabase.from("usage_records").insert(usageRows);
  if (usageErr) {
    return NextResponse.json({ error: usageErr.message }, { status: 500 });
  }

  // 3. Auditoría
  await supabase.from("audit_logs").insert({
    accion: "IMPORT",
    detalle: `Archivo: ${archivo_nombre} — ${registros.length} registros`,
  });

  return NextResponse.json({ import_id: (importData as { id: string }).id, total: registros.length }, { status: 201 });
}

// DELETE /api/imports?id=xxx — eliminar import y sus registros
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

  const { error } = await supabase.from("imports").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
