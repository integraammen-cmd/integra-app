import { createClient } from "@/app/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { query } = await request.json();
  if (!query) return NextResponse.json({ error: "Pregunta requerida" }, { status: 400 });

  // 1. Buscar en Supabase: servicios, eventos, matriz, briefings
  const [servicesRes, eventsRes, briefingsRes, matrixRes] = await Promise.all([
    supabase.from("services").select("name, group_id, service_groups(name)").limit(20),
    supabase.from("events").select("title, start_time, category").eq("user_id", user.id).limit(10).order("start_time", { ascending: false }),
    supabase.from("morning_briefings").select("date, summary").eq("user_id", user.id).limit(3).order("date", { ascending: false }),
    supabase.from("service_base_prices").select("base_price, services!inner(name, group_id, service_groups!inner(name))").limit(20),
  ]);

  // Construir contexto
  const context = [
    "### Servicios de la mutual:",
    ...(servicesRes.data || []).map((s: Record<string, unknown>) => `- ${s.name} (${(s.service_groups as { name: string })?.name})`),
    "",
    "### Próximos eventos:",
    ...(eventsRes.data || []).map((e: Record<string, unknown>) => `- ${e.title} | ${new Date(e.start_time as string).toLocaleString("es-AR")} | ${e.category}`),
    "",
    "### Briefings recientes:",
    ...(briefingsRes.data || []).map((b: Record<string, unknown>) => `- ${b.date}: ${(b.summary as string).slice(0, 200)}...`),
    "",
    "### Matriz de precios (muestra):",
    ...(matrixRes.data || []).slice(0, 15).map((p: Record<string, unknown>) => {
      const svc = p.services as { name: string; group_id: string; service_groups: { name: string } };
      return `- ${svc?.name || "?"} (${svc?.service_groups?.name || "?"}): $${p.base_price}`;
    }),
  ].join("\n");

  const systemPrompt = `Eres el asistente IA de Integra Mutual de Salud y Servicios Sociales. Solo respondes con datos que están en el contexto proporcionado. Si te preguntan algo que no está en el contexto, decí "Esa información no está disponible en mi base de datos. ¿Querés que busque en la web?". NUNCA inventes datos, precios, nombres de servicios ni eventos. Sé conciso y profesional.`;

  // 2. Llamar a Gemini
  let responseText = "";
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{
            role: "user",
            parts: [{ text: `Contexto de la base de datos:\n${context}\n\nPregunta del Coordinador: ${query}` }],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
        }),
      }
    );

    if (geminiRes.ok) {
      const json = (await geminiRes.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";
    } else {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      responseText = "Error al conectar con el asistente IA.";
    }
  } catch (err) {
    console.error("IA chat error:", err);
    responseText = "Error al conectar con el asistente IA.";
  }

  return NextResponse.json({ response: responseText, source: "supabase+gemini" });
}
