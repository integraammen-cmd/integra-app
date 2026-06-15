import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/events — listar eventos del usuario
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", user.id)
    .order("start_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/events — crear evento
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { title, description, start_time, end_time, category, alarm_enabled, notification_offset } = body;

  if (!title || !start_time || !category) {
    return NextResponse.json({ error: "title, start_time y category son requeridos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title,
      description: description || "",
      start_time,
      end_time: end_time || null,
      category,
      alarm_enabled: alarm_enabled || false,
      notification_offset: notification_offset || "15 minutes",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
