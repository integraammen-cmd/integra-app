import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/services — listar servicios con precios y grupos (cache 60s)
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      name,
      group_id,
      service_groups ( name ),
      service_base_prices ( base_price )
    `)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Aplanar la respuesta para el frontend
  const flat = (data || []).map((s: Record<string, unknown>) => ({
    id: s.id,
    name: s.name,
    group_id: s.group_id,
    group_name: (s.service_groups as { name: string })?.name || "",
    base_price: (s.service_base_prices as { base_price: number })?.base_price || 0,
  }));

  return NextResponse.json(flat, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

// POST /api/services — crear servicio + precio base
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { name, group_id, base_price } = await request.json();

  if (!name || !group_id || base_price == null) {
    return NextResponse.json({ error: "name, group_id y base_price son requeridos" }, { status: 400 });
  }

  // 1. Crear servicio
  const { data: service, error: sErr } = await supabase
    .from("services")
    .insert({ name, group_id })
    .select()
    .single();

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // 2. Crear precio base
  const { error: pErr } = await supabase
    .from("service_base_prices")
    .insert({ service_id: (service as { id: string }).id, base_price });

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  return NextResponse.json(service, { status: 201 });
}
