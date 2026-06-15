import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Vercel Cron llama a este endpoint cada 1 minuto
// Configurar en Vercel Dashboard → Settings → Cron Jobs
// Ruta: /api/cron/alarm-worker
// Schedule: * * * * * (cada minuto)

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const now = new Date().toISOString();

  // Buscar eventos con alarma activa cuyo start_time - notification_offset ≈ minuto actual
  // Rango: ±30 segundos para cubrir el tick del cron
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("alarm_enabled", true)
    .lte("start_time", now) // el evento ya "debería" haber sonado
    .gte(
      "start_time",
      new Date(Date.now() - 60000 * 5).toISOString() // ventana de 5 min para no procesar viejos
    )
    .order("start_time", { ascending: true });

  if (error) {
    console.error("alarmWorker: error al consultar eventos", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const triggered: unknown[] = [];

  for (const event of events || []) {
    // Calcular si la alarma debe sonar ahora
    const startTime = new Date(event.start_time).getTime();
    const offsetMs =
      (event.notification_offset || "15 minutes") === "15 minutes"
        ? 15 * 60000
        : parseInterval(event.notification_offset || "15 minutes");

    const alarmTime = startTime - offsetMs;
    const currentTime = Date.now();

    // Si la alarma debería haber sonado en el último minuto (±30s)
    if (Math.abs(currentTime - alarmTime) < 60000) {
      // Estructurar payload para Firebase Cloud Messaging
      const payload = {
        notification: {
          title: `📅 ${event.title}`,
          body: `Categoría: ${event.category} | ${new Date(event.start_time).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`,
        },
        data: {
          event_id: event.id,
          category: event.category,
          start_time: event.start_time,
          click_action: "OPEN_AGENDA",
        },
      };

      // TODO: enviar a Firebase Cloud Messaging
      // await admin.messaging().sendToDevice(deviceToken, payload);

      console.log(`[alarmWorker] Alarma disparada: ${event.title} (${event.id})`);
      triggered.push({ event_id: event.id, title: event.title, payload });
    }
  }

  return NextResponse.json({
    ok: true,
    checked: events?.length || 0,
    triggered: triggered.length,
    alarms: triggered,
  });
}

function parseInterval(interval: string): number {
  // Parsea '15 minutes', '30 minutes', '1 hour', etc. a ms
  const match = interval.match(/(\d+)\s*(minute|hour|day)/i);
  if (!match) return 15 * 60000;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "minute") return value * 60000;
  if (unit === "hour") return value * 3600000;
  if (unit === "day") return value * 86400000;
  return 15 * 60000;
}
