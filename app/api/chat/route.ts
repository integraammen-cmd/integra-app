// [FIX v0.3.1]: Motor de chat 100% local — consulta directa a Supabase sin depender de Gemini
// Si GEMINI_API_KEY está configurada, se usa Gemini como mejora opcional.
import { createClient } from "../../lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------
type SvcRow = { name: string; group_id: string; service_groups: { name: string } | null };
type EvtRow = { title: string; start_time: string; category: string };
type PriceRow = {
  base_price: number;
  services: { name: string; group_id: string; service_groups: { name: string } | null } | null;
};

// ---------------------------------------------------------------------------
// Motor local: detecta intención y consulta las tablas necesarias
// ---------------------------------------------------------------------------
async function localEngine(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  query: string,
): Promise<string> {
  const q = query.toLowerCase();

  // --- Detección de intenciones ---
  const wantsPrices =
    wordsIn(q, "precio", "costo", "tarifa", "$", "caro", "barato", "cuesta", "vale", "promedio");
  const wantsEvents =
    wordsIn(q, "evento", "agenda", "semana", "hoy", "mañana", "urgente", "calendario", "reunión");
  const wantsServices =
    wordsIn(q, "servicio", "servicios", "cuántos", "cuantos", "total", "cantidad", "categoría", "grupo", "listado");
  const wantsSummary =
    wordsIn(q, "resumen", "operativo", "general", "todo", "panorama");

  // Si no se detecta intención clara, damos resumen general
  if (!wantsPrices && !wantsEvents && !wantsServices && !wantsSummary) {
    return await buildGeneralSummary(supabase, userId);
  }

  const parts: string[] = [];

  // --- Precios ---
  if (wantsPrices) {
    const { data: prices } = await supabase
      .from("service_base_prices")
      .select("base_price, services!inner(name, group_id, service_groups!inner(name))")
      .limit(100);

    if (!prices || prices.length === 0) {
      parts.push("📊 No hay precios cargados todavía.");
    } else {
      const list = prices as unknown as PriceRow[];
      const valid = list.filter((p) => p.base_price != null && p.services != null);

      if (q.includes("más caro") || q.includes("mas caro")) {
        const top = valid.sort((a, b) => b.base_price - a.base_price).slice(0, 5);
        parts.push("🔝 **Servicios más caros:**\n" + top.map((p, i) =>
          `  ${i + 1}. ${p.services!.name} (${p.services!.service_groups?.name || "—"}) → $${p.base_price.toFixed(2)}`
        ).join("\n"));

      } else if (q.includes("más barato") || q.includes("mas barato")) {
        const bottom = valid.sort((a, b) => a.base_price - b.base_price).slice(0, 5);
        parts.push("📉 **Servicios más baratos:**\n" + bottom.map((p, i) =>
          `  ${i + 1}. ${p.services!.name} (${p.services!.service_groups?.name || "—"}) → $${p.base_price.toFixed(2)}`
        ).join("\n"));

      } else if (q.includes("sin precio") || q.includes("sin valor") || q.includes("faltante")) {
        const { data: svcWithout } = await supabase
          .from("services")
          .select("name, group_id, service_groups(name)")
          .limit(200);
        const withPrices = new Set((prices || []).map((p: Record<string, unknown>) => (p.services as { name: string })?.name));
        const missing = (svcWithout || []).filter(
          (s: Record<string, unknown>) => !withPrices.has(s.name as string)
        );
        parts.push(`⚠️ **Servicios sin precio (${missing.length}):**\n` +
          missing.slice(0, 15).map((s: Record<string, unknown>) =>
            `  • ${s.name} (${(s.service_groups as { name: string })?.name || "—"})`
          ).join("\n") +
          (missing.length > 15 ? `\n  …y ${missing.length - 15} más.` : "")
        );

      } else if (q.includes("promedio")) {
        const avg = valid.reduce((sum, p) => sum + p.base_price, 0) / valid.length;
        parts.push(`📊 **Costo promedio general:** $${avg.toFixed(2)}\n  (sobre ${valid.length} servicios con precio)`);

      } else {
        // Listado de precios resumido
        parts.push("💰 **Precios de servicios:**\n" + valid.slice(0, 20).map((p) =>
          `  • ${p.services!.name} → $${p.base_price.toFixed(2)}`
        ).join("\n") +
          (valid.length > 20 ? `\n  …y ${valid.length - 20} más.` : "")
        );
      }
    }
  }

  // --- Eventos ---
  if (wantsEvents) {
    const today = new Date().toISOString().split("T")[0];
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    let eventQuery = supabase
      .from("events")
      .select("title, start_time, category")
      .eq("user_id", userId)
      .order("start_time", { ascending: true });

    if (q.includes("urgente")) {
      eventQuery = eventQuery.eq("category", "urgente");
    } else if (q.includes("semana") || q.includes("próximo") || q.includes("proximo")) {
      eventQuery = eventQuery.gte("start_time", today).lte("start_time", weekEnd);
    } else if (q.includes("hoy")) {
      eventQuery = eventQuery.gte("start_time", today).lt("start_time", new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    }

    const { data: events } = await eventQuery.limit(15);
    const evtList = (events || []) as unknown as EvtRow[];

    if (evtList.length === 0) {
      parts.push("📅 No hay eventos que coincidan con tu búsqueda.");
    } else {
      parts.push("📅 **Eventos:**\n" + evtList.map((e) => {
        const fecha = new Date(e.start_time).toLocaleString("es-AR", {
          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
        });
        const cat = e.category === "urgente" ? "🔴" : e.category === "salud" ? "🩺" : e.category === "gremial" ? "⚒️" : e.category === "sociales" ? "🎉" : "📋";
        return `  ${cat} ${fecha} — ${e.title}`;
      }).join("\n"));
    }
  }

  // --- Servicios / grupos ---
  if (wantsServices) {
    const { data: svc } = await supabase
      .from("services")
      .select("name, group_id, service_groups(name)")
      .limit(200);
    const list = (svc || []) as unknown as SvcRow[];

    if (q.includes("cuántos") || q.includes("cuantos") || q.includes("total") || q.includes("cantidad")) {
      parts.push(`📋 **Total de servicios cargados:** ${list.length}`);
    } else if (q.includes("grupo") || q.includes("categoría")) {
      const byGroup: Record<string, number> = {};
      list.forEach((s) => {
        const g = s.service_groups?.name || "Sin grupo";
        byGroup[g] = (byGroup[g] || 0) + 1;
      });
      parts.push("📂 **Servicios por categoría:**\n" + Object.entries(byGroup)
        .sort(([, a], [, b]) => b - a)
        .map(([g, n]) => `  • ${g}: ${n} servicios`)
        .join("\n"));
    } else {
      // Listado simple
      parts.push("📋 **Servicios:**\n" + list.slice(0, 20).map((s) =>
        `  • ${s.name} (${s.service_groups?.name || "—"})`
      ).join("\n") + (list.length > 20 ? `\n  …y ${list.length - 20} más.` : ""));
    }
  }

  // --- Resumen general ---
  if (wantsSummary || parts.length === 0) {
    const summary = await buildGeneralSummary(supabase, userId);
    parts.push(summary);
  }

  return parts.join("\n\n");
}

// ---------------------------------------------------------------------------
// Resumen general (datos clave en pocas líneas)
// ---------------------------------------------------------------------------
async function buildGeneralSummary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

  const [svcCount, priceRes, urgentRes, weekRes] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("service_base_prices").select("base_price").limit(200),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("category", "urgente").gte("start_time", today),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("start_time", today).lte("start_time", weekEnd),
  ]);

  const totalSvc = svcCount.count ?? 0;
  const prices = ((priceRes.data || []) as { base_price: number }[]).filter((p) => p.base_price != null);
  const avgPrice = prices.length > 0
    ? prices.reduce((s, p) => s + p.base_price, 0) / prices.length
    : 0;
  const urgentCount = urgentRes.count ?? 0;
  const weekCount = weekRes.count ?? 0;

  return [
    `🧠 **Resumen operativo** (datos reales de tu mutual)`,
    ``,
    `📋 **${totalSvc}** servicios cargados`,
    `💰 Costo promedio: **$${avgPrice.toFixed(2)}** (${prices.length} con precio)`,
    `📅 **${weekCount}** eventos esta semana`,
    urgentCount > 0 ? `🔴 **${urgentCount}** eventos urgentes hoy` : `✅ Sin urgentes para hoy`,
    ``,
    `💡 _Probá preguntar: "servicio más caro", "eventos urgentes", "cuántos servicios sin precio", "servicios por categoría"_`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function wordsIn(text: string, ...words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

// ---------------------------------------------------------------------------
// Gemini (opcional, solo si GEMINI_API_KEY está configurada)
// ---------------------------------------------------------------------------
async function geminiEngine(context: string, query: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY || "";
  const isAuthKey = key.startsWith("AQ");
  const systemPrompt =
    "Eres el asistente IA de Integra Mutual de Salud. Solo respondes con datos del contexto. NUNCA inventes precios, servicios ni eventos. Si no está en el contexto, decí que no tenés ese dato. Sé conciso.";

  const url = isAuthKey
    ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isAuthKey) headers["x-goog-api-key"] = key;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: `Contexto:\n${context}\n\nPregunta: ${query}` }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
    }),
  });

  if (res.ok) {
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return json.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";
  }

  throw new Error(`Gemini ${res.status}`);
}

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { query } = await request.json();
  if (!query) return NextResponse.json({ error: "Pregunta requerida" }, { status: 400 });

  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

  // --- Siempre ejecutar el motor local primero (datos reales, sin alucinaciones) ---
  const localResponse = await localEngine(supabase, user.id, query);

  // --- Si hay Gemini, lo usamos para mejorar el formato de la respuesta ---
  if (GEMINI_KEY) {
    try {
      const enhanced = await geminiEngine(localResponse, query);
      return NextResponse.json({ response: enhanced, source: "gemini+local" });
    } catch (err) {
      console.error("Gemini falló, usando motor local:", err);
    }
  }

  // --- Respuesta del motor local (siempre disponible) ---
  return NextResponse.json({ response: localResponse, source: "local" });
}
