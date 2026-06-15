import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Vercel Cron llama a este endpoint cada día a las 6:00 AM
// Schedule: 0 6 * * *
// Ruta: /api/cron/morning-briefing

const SYSTEM_PROMPT = `Actúas como el Director Ejecutivo de Operaciones y Asistente Estratégico de un Coordinador General de una Mutual de Salud. Tu objetivo es procesar la agenda provista y devolver un informe gerencial estructurado, sumamente profesional, con terminología corporativa del ámbito de obras sociales y sindicatos. El formato de salida debe ser exclusivamente Markdown y contener tres secciones: ## ☀️ Enfoque del Día (2 líneas estratégicas), ## 🚨 Alertas Críticas (Prioridades altas con horas exactas y contexto de preparación) y ## 🗓️ Hoja de Ruta Ejecutiva (Bloques resumidos de mañana y tarde). Sé extremadamente conciso; la lectura completa no debe superar los 90 segundos.`;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const startOfDay = `${todayStr}T00:00:00Z`;
  const endOfDay = `${todayStr}T23:59:59Z`;

  // 1. Eventos de Supabase para hoy
  const { data: events, error: evtErr } = await supabase
    .from("events")
    .select("*")
    .gte("start_time", startOfDay)
    .lte("start_time", endOfDay)
    .order("start_time", { ascending: true });

  if (evtErr) {
    console.error("morningBriefing: error consultando eventos", evtErr.message);
  }

  // 2. Alertas críticas del día anterior (eventos urgentes o pendientes)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: criticalAlerts, error: alertErr } = await supabase
    .from("events")
    .select("*")
    .eq("category", "urgente")
    .gte("start_time", `${yesterdayStr}T00:00:00Z`)
    .lte("start_time", `${yesterdayStr}T23:59:59Z`)
    .order("start_time", { ascending: true });

  if (alertErr) {
    console.error("morningBriefing: error consultando alertas", alertErr.message);
  }

  // 3. Armar payload para el LLM
  const agendaLines = (events || []).map(
    (e: { title: string; start_time: string; end_time: string | null; category: string; description: string }) =>
      `- ${e.start_time.slice(11, 16)} ${e.end_time ? "a " + e.end_time.slice(11, 16) : ""} | ${e.category.toUpperCase()} | ${e.title}${e.description ? " — " + e.description : ""}`
  );

  const alertLines = (criticalAlerts || []).map(
    (a: { title: string; start_time: string; description: string }) =>
      `- ⚠️ ${a.start_time.slice(11, 16)} | ${a.title}${a.description ? " — " + a.description : ""}`
  );

  const userPrompt = `Fecha: ${todayStr}

## Agenda del día
${agendaLines.length > 0 ? agendaLines.join("\n") : "Sin eventos programados."}

## Alertas pendientes de ayer
${alertLines.length > 0 ? alertLines.join("\n") : "Sin alertas críticas pendientes."}

Generá el informe ejecutivo en Markdown según tu System Prompt.`;

  // 4. Llamar al LLM (OpenAI)
  let summary = "";
  let alerts: unknown[] = [];

  if (process.env.OPENAI_API_KEY) {
    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: 600,
        }),
      });

      if (openaiRes.ok) {
        const json = (await openaiRes.json()) as {
          choices: { message: { content: string } }[];
        };
        summary = json.choices?.[0]?.message?.content || "";
      }
    } catch (err) {
      console.error("morningBriefing: error llamando a OpenAI", err);
    }
  }

  // Fallback sin LLM
  if (!summary) {
    summary = `## ☀️ Enfoque del Día\nSin conexión al modelo de IA. Revisar agenda manualmente.\n\n## 🚨 Alertas Críticas\n${alertLines.join("\n") || "Sin alertas."}\n\n## 🗓️ Hoja de Ruta Ejecutiva\n${agendaLines.join("\n") || "Sin eventos."}`;
  }

  // 5. Sanitizar output (B4 PSAI)
  const sanitized = summary
    .replace(/```/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .trim();

  // 6. Guardar briefing
  const { error: insertErr } = await supabase.from("morning_briefings").upsert(
    {
      user_id: (events?.[0] as { user_id?: string })?.user_id || "system",
      date: todayStr,
      summary: sanitized,
      critical_alerts: alertLines,
    },
    { onConflict: "user_id,date" }
  );

  if (insertErr) {
    console.error("morningBriefing: error guardando briefing", insertErr.message);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    date: todayStr,
    events_count: events?.length || 0,
    alerts_count: criticalAlerts?.length || 0,
    summary_preview: sanitized.slice(0, 200),
  });
}
