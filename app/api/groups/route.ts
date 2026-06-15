import { createClient } from "@/app/lib/supabase-server";
import { NextResponse } from "next/server";

// GET /api/groups — listar grupos (cache 5 min, cambian muy poco)
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_groups")
    .select("*")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
