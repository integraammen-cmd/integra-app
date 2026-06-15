import { createClient } from "../../lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { query } = await request.json();
  if (!query) return NextResponse.json({ error: "Pregunta requerida" }, { status: 400 });

  const GEMINI_KEY = process.env.GEMINI_API_KEY || "";

  // 1. Buscar en Supabase
  const [servicesRes, eventsRes, matrixRes] = await Promise.all([
    supabase.from("services").select("name, group_id, service_groups(name)").limit(30),
    supabase.from("events").select("title, start_time, category").eq("user_id", user.id).limit(10).order("start_time", { ascending: false }),
    supabase.from("service_base_prices").select("base_price, services!inner(name, group_id, service_groups!inner(name))").limit(30),
  ]);

  const context = [
    "### Servicios:", ...(servicesRes.data || []).map((s: Record<string, unknown>) => `- ${s.name} (${(s.service_groups as { name: string })?.name})`),
    "### Eventos:", ...(eventsRes.data || []).map((e: Record<string, unknown>) => `- ${e.title} | ${new Date(e.start_time as string).toLocaleString("es-AR")} | ${e.category}`),
    "### Precios (muestra):", ...(matrixRes.data || []).slice(0, 15).map((p: Record<string, unknown>) => {
      const svc = p.services as { name: string; service_groups: { name: string } };
      return `- ${svc?.name || "?"} (${svc?.service_groups?.name || "?"}): $${p.base_price}`;
    }),
  ].join("\n");

  // 2. Si no hay API key, devolver datos directamente
  if (!GEMINI_KEY) {
    return NextResponse.json({
      response: `No tengo API key de Gemini configurada, pero esto es lo que hay en la base:\n\n${context.slice(0, 800)}`,
      source: "supabase",
    });
  }

  // 3. Llamar a Gemini (soporta API keys AIza... y Auth keys AQ...)
  const isAuthKey = GEMINI_KEY.startsWith("AQ");
  const systemPrompt = "Eres el asistente IA de Integra Mutual de Salud. Solo respondes con datos del contexto. NUNCA inventes precios, servicios ni eventos. Si no está en el contexto, decí que no tenés ese dato. Sé conciso.";

  try {
    const url = isAuthKey
      ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isAuthKey) {
      // Auth keys (AQ...) usan x-goog-api-key header en vez de query param
      headers["x-goog-api-key"] = GEMINI_KEY;
    }

    const geminiRes = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{
          role: "user",
          parts: [{ text: `Contexto de la base de datos:\n${context}\n\nPregunta del Coordinador: ${query}` }],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
      }),
    });

    if (geminiRes.ok) {
      const json = (await geminiRes.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";
      return NextResponse.json({ response: responseText, source: "gemini" });
    } else {
      const errText = await geminiRes.text();
      console.error("Gemini error:", geminiRes.status, errText.slice(0, 200));
      return NextResponse.json({
        response: `(Error Gemini ${geminiRes.status}) Esto es lo que hay en la base:\n\n${context.slice(0, 800)}`,
        source: "supabase-fallback",
      });
    }
  } catch (err) {
    console.error("IA chat error:", err);
    return NextResponse.json({
      response: `(Error de red) Esto es lo que hay en la base:\n\n${context.slice(0, 800)}`,
      source: "supabase-fallback",
    });
  }
}
