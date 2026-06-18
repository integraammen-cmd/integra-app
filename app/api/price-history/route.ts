// [FEATURE v0.3.0]: API para service_price_history
import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const serviceId = request.nextUrl.searchParams.get("service_id");

  let query = supabase
    .from("service_price_history")
    .select("*")
    .order("vigente_desde", { ascending: false });

  if (serviceId) query = query.eq("service_id", serviceId);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
