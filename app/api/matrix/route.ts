import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

// GET /api/matrix — matriz de costos calculada (cache 30s)
// [FIX v0.2.4]: Descuentos por grupo desde group_discounts en vez de hardcodeados
export async function GET() {
  const supabase = await createClient();

  // Leer servicios con precios y grupos
  const { data: services, error: sErr } = await supabase
    .from("services")
    .select(`
      id,
      name,
      group_id,
      service_groups ( name ),
      service_base_prices ( base_price )
    `)
    .order("name");

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

  // [FIX v0.2.4]: Leer descuentos por grupo desde group_discounts
  const { data: groupDiscounts, error: gdErr } = await supabase
    .from("group_discounts")
    .select("group_id, tipo_socio, descuento_porcentaje");

  // Fallback a partner_discounts si group_discounts no existe o está vacío
  const discountMap: Record<string, Record<string, number>> = {};

  if (!gdErr && groupDiscounts && groupDiscounts.length > 0) {
    // Agrupar descuentos por group_id → tipo_socio → porcentaje
    (groupDiscounts as { group_id: string; tipo_socio: string; descuento_porcentaje: number }[]).forEach((d) => {
      if (!discountMap[d.group_id]) discountMap[d.group_id] = {};
      discountMap[d.group_id][d.tipo_socio] = d.descuento_porcentaje;
    });
  } else {
    // Fallback: leer partner_discounts (comportamiento anterior)
    const { data: legacyDiscounts } = await supabase
      .from("partner_discounts")
      .select("*");

    const globalDiscounts: Record<string, number> = {};
    (legacyDiscounts || []).forEach((d: { partner_type: string; discount_percentage: number | null }) => {
      globalDiscounts[d.partner_type] = d.discount_percentage ?? 0;
    });

    // Aplicar mismos descuentos a todos los grupos como fallback
    const { data: allGroups } = await supabase.from("service_groups").select("id");
    (allGroups || []).forEach((g: { id: string }) => {
      discountMap[g.id] = { ...globalDiscounts };
    });
  }

  const matrix = (services || []).map((s: Record<string, unknown>) => {
    const base = (s.service_base_prices as { base_price: number })?.base_price || 0;
    const groupId = s.group_id as string;
    const groupDisc = discountMap[groupId] || {};

    const calc = (tipoSocio: string) => {
      const pct = groupDisc[tipoSocio];
      if (pct == null) return null;
      return Math.round((base * (1 - pct / 100)) * 100) / 100;
    };

    return {
      id: s.id,
      name: s.name,
      group_name: (s.service_groups as { name: string })?.name || "",
      activo: calc("Activo"),
      integra_90: calc("Integra 90"),
      integra_180: calc("Integra 180"),
      integra_360: calc("Integra 360"),
      integra_360_plus: calc("Integra 360 Plus"),
    };
  });

  return NextResponse.json(matrix, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
