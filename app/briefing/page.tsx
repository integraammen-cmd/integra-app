"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hola, soy el asistente de Integra. Preguntame sobre servicios, precios, eventos o la matriz de costos. Solo respondo con datos reales de la base de datos." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.response || "Sin respuesta." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Error de conexión." }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f1117] pb-20">
      <header className="border-b border-zinc-800 px-5 py-4">
        <h1 className="text-lg font-bold text-white">IA CHAT</h1>
        <p className="text-xs text-zinc-500">Basado en datos reales de la mutual</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
              m.role === "user" ? "bg-[#1e3c72] text-white" : "bg-zinc-800/80 text-zinc-200 border border-zinc-700"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="rounded-xl bg-zinc-800/80 px-4 py-3 text-sm text-zinc-400 border border-zinc-700">Pensando...</div></div>}
      </div>

      <div className="border-t border-zinc-800 px-4 py-3 pb-4">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Preguntá sobre servicios, precios, eventos..." className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-400" />
          <button onClick={send} disabled={loading} className="rounded-lg bg-[#1e3c72] px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-900 disabled:opacity-50 transition-colors">Enviar</button>
        </div>
      </div>
    </div>
  );
}
