// [FEATURE v0.3.0]: API de estadísticas de uso
import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const tipo_socio = searchParams.get("tipo_socio");
  const grupo = searchParams.get("grupo");

  let query = supabase.from("usage_records").select("*");

  if (desde) query = query.gte("fecha_uso", desde);
  if (hasta) query = query.lte("fecha_uso", hasta);
  if (tipo_socio && tipo_socio !== "Todos") {
    query = query.eq("tipo_socio", tipo_socio);
  }
  if (grupo && grupo !== "todas") {
    // Join con services para filtrar por grupo
    query = query.eq("service_id.grupo", grupo);
  }

  const { data, error } = await query.order("fecha_uso", { ascending: false }).limit(5000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
