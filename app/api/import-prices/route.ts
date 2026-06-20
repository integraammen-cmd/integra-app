// [FIX v0.2.4]: Importación masiva de precios desde CSV
import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { updates } = await request.json();
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates requerido (array no vacío)" }, { status: 400 });
  }

  // updates: [{ service_id: string, new_price: number }]
  const results: { service_id: string; success: boolean; error?: string }[] = [];
  let updatedCount = 0;

  for (const u of updates) {
    if (!u.service_id || u.new_price == null) {
      results.push({ service_id: u.service_id || "?", success: false, error: "Datos incompletos" });
      continue;
    }

    const { error } = await supabase
      .from("service_base_prices")
      .upsert(
        { service_id: u.service_id, base_price: u.new_price, updated_at: new Date().toISOString() },
        { onConflict: "service_id" }
      );

    if (error) {
      results.push({ service_id: u.service_id, success: false, error: error.message });
    } else {
      results.push({ service_id: u.service_id, success: true });
      updatedCount++;
    }
  }

  // Registrar en audit_logs
  await supabase.from("audit_logs").insert({
    event_type: "PRICE_IMPORT",
    usuario_id: user.id,
    descripcion: `Importación CSV: ${updatedCount}/${updates.length} precios actualizados`,
    severity: "info",
    contexto: { total: updates.length, actualizados: updatedCount },
  });

  return NextResponse.json({
    updated: updatedCount,
    total: updates.length,
    results,
  });
}
