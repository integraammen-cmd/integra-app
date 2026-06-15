import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/price-update — aumento porcentual masivo con redondeo
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const {
    group_id = null,
    percentage_increase,
    rounding_rule = "none",
  } = body;

  if (percentage_increase == null || percentage_increase < 0) {
    return NextResponse.json(
      { error: "percentage_increase requerido y debe ser >= 0" },
      { status: 400 }
    );
  }

  if (!["none", "nearest_10", "nearest_100"].includes(rounding_rule)) {
    return NextResponse.json(
      { error: "rounding_rule debe ser: none, nearest_10 o nearest_100" },
      { status: 400 }
    );
  }

  const factor = 1 + percentage_increase / 100;

  // Usar función SQL definida en spec/price_update_function.sql
  const { data: result, error } = await supabase.rpc("apply_price_increase", {
    p_group_id: group_id,
    p_factor: factor,
    p_rounding_rule: rounding_rule,
  });

  if (error) {
    return NextResponse.json({ error: `Error SQL: ${error.message}. Ejecutá spec/price_update_function.sql primero.` }, { status: 500 });
  }

  const updatedCount = (result as number) || 0;

  // Registrar en audit_logs
  await supabase.from("audit_logs").insert({
    event_type: "price_update",
    usuario_id: user.id,
    descripcion: `Aumento del ${percentage_increase}% (redondeo: ${rounding_rule})${group_id ? ` group_id=${group_id}` : " TODOS los servicios"}. ${updatedCount} filas modificadas.`,
    severity: "warning",
    contexto: { group_id, percentage_increase, rounding_rule, updated_count: updatedCount },
  });

  return NextResponse.json({
    ok: true,
    updated_count: updatedCount,
    percentage_increase,
    rounding_rule,
  });
}
