import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

// GET /api/matrix — matriz de costos calculada (cache 30s)
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

  // Leer descuentos
  const { data: discounts, error: dErr } = await supabase
    .from("partner_discounts")
    .select("*")
    .order("discount_percentage", { ascending: true, nullsFirst: false });

  if (dErr) return NextResponse.json({ error: dErr.message }, { status: 500 });

  // Calcular matriz
  const discountMap: Record<string, number | null> = {};
  (discounts || []).forEach((d: { partner_type: string; discount_percentage: number | null }) => {
    discountMap[d.partner_type] = d.discount_percentage;
  });

  const matrix = (services || []).map((s: Record<string, unknown>) => {
    const base = (s.service_base_prices as { base_price: number })?.base_price || 0;

    const calc = (pct: number | null | undefined) => {
      if (pct == null) return null;
      return Math.round((base * (1 - pct / 100)) * 100) / 100;
    };

    return {
      id: s.id,
      name: s.name,
      group_name: (s.service_groups as { name: string })?.name || "",
      activo: calc(discountMap["Activo"]),
      integra_90: calc(discountMap["Integra 90"]),
      integra_180: calc(discountMap["Integra 180"]),
      integra_360: calc(discountMap["Integra 360"]),
      integra_360_plus: calc(discountMap["Integra 360 Plus"]),
    };
  });

  return NextResponse.json(matrix, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
