// [REFACTOR v0.2.0]: IA Chat redesign — Integra Mutual brand identity
"use client";

import { useState } from "react";

const SUGGESTED_CHIPS = [
  "¿Cuál es el servicio más caro?",
  "¿Eventos urgentes esta semana?",
  "¿Cuántos servicios sin precio?",
  "Resumen operativo de hoy",
  "¿Costo promedio para socio Activo?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(query?: string) {
    const q = (query || input).trim();
    if (!q || loading) return;
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
    <div className="page-container" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 16px 8px 16px",
          margin: "0 -16px",
        }}
      >
        <h1 className="text-[20px] font-bold text-white">IA CHAT</h1>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Basado en datos reales de la mutual
        </p>
      </header>

      {/* Messages area */}
      <div
        className="overflow-y-auto px-4 py-4 space-y-3"
        style={{ height: "calc(100vh - 120px)" }}
      >
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div
              className="mb-5 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent-green-soft)" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-green)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 2a10 10 0 0 1 10 10h-10V2z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">
              Hola, soy el asistente de Integra
            </p>
            <p
              className="mt-1 text-[13px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Preguntame sobre servicios, precios o tu agenda
            </p>

            {/* Suggested chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-sm">
              {SUGGESTED_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  className="chip"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? {
                        background: "var(--accent-green-soft)",
                        border: "1px solid var(--border-accent)",
                        color: "var(--text-primary)",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--bg-card)",
                        color: "var(--text-primary)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-muted)",
                borderBottomLeftRadius: "4px",
              }}
            >
              Pensando...
            </div>
          </div>
        )}
      </div>

      {/* Input bar — fijo sobre navbar */}
      <div
        style={{
          position: "fixed",
          bottom: "65px",
          left: 0,
          right: 0,
          padding: "8px 16px",
          background: "var(--bg-base)",
          borderTop: "1px solid var(--border)",
          zIndex: 40,
        }}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Preguntá sobre servicios, precios, eventos..."
            className="input-field flex-1"
          />
          <button
            onClick={() => send()}
            disabled={loading}
            className="btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

