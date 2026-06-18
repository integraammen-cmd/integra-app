// [FEATURE v0.3.0]: API para app_settings
import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: Record<string, string> = {};
  (data || []).forEach((r: { key: string; value: string }) => {
    settings[r.key] = r.value;
  });
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: "key y value requeridos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: body.key, value: String(body.value), updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
