import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/services/[id] — actualizar servicio o precio
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const { name, group_id, base_price } = await request.json();

  if (name || group_id) {
    const update: Record<string, string> = {};
    if (name) update.name = name;
    if (group_id) update.group_id = group_id;
    const { error } = await supabase.from("services").update(update).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (base_price != null) {
    const { error } = await supabase
      .from("service_base_prices")
      .upsert({ service_id: id, base_price }, { onConflict: "service_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/services/[id] — eliminar servicio (cascade a precio)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
