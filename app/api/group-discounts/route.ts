// [FIX v0.2.4]: API para leer y guardar descuentos por grupo
import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/group-discounts — leer todos los descuentos
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_discounts")
    .select("id, group_id, tipo_socio, descuento_porcentaje");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/group-discounts — guardar/actualizar un descuento
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { group_id, tipo_socio, descuento_porcentaje } = await request.json();
  if (!group_id || !tipo_socio || descuento_porcentaje == null) {
    return NextResponse.json({ error: "group_id, tipo_socio y descuento_porcentaje requeridos" }, { status: 400 });
  }

  // Upsert: inserta o actualiza
  const { error } = await supabase
    .from("group_discounts")
    .upsert(
      { group_id, tipo_socio, descuento_porcentaje, updated_at: new Date().toISOString() },
      { onConflict: "group_id, tipo_socio" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Registrar en audit_logs
  await supabase.from("audit_logs").insert({
    event_type: "DISCOUNT_UPDATE",
    usuario_id: user.id,
    descripcion: `Descuento actualizado: grupo=${group_id}, socio=${tipo_socio}, %=${descuento_porcentaje}`,
    severity: "info",
  });

  return NextResponse.json({ success: true });
}
