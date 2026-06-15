"use client";

import { useEffect, useState, useCallback } from "react";

export default function BriefingPage() {
  const [briefings, setBriefings] = useState<
    { id: string; date: string; summary: string; critical_alerts: string[] }[]
  >([]);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/briefings");
    if (res.ok) {
      const data = await res.json();
      setBriefings(data);
      if (data.length > 0) setSelected(data[0].id);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const current = briefings.find((b) => b.id === selected);

  return (
    <div className="mx-auto flex max-w-4xl gap-6 px-4 py-8">
      {/* Sidebar */}
      <div className="w-56 shrink-0 space-y-1">
        <h2 className="mb-3 text-sm font-semibold text-[#1e3c72]">Briefings</h2>
        {briefings.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelected(b.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              selected === b.id
                ? "bg-[#1e3c72] text-white"
                : "text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {new Date(b.date + "T00:00:00").toLocaleDateString("es-AR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </button>
        ))}
        {briefings.length === 0 && (
          <p className="text-xs text-zinc-400">Sin briefings aún</p>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 rounded-xl bg-white p-6 shadow-sm">
        {current ? (
          <div className="prose prose-sm max-w-none">
            <h1 className="mb-1 text-lg font-bold text-[#1e3c72]">
              Briefing — {new Date(current.date + "T00:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
            </h1>
            <div
              dangerouslySetInnerHTML={{
                __html: current.summary
                  .replace(/## /g, "<h2>")
                  .replace(/### /g, "<h3>")
                  .replace(/\n\n/g, "</p><p>")
                  .replace(/\n- /g, "<br/>- "),
              }}
            />
          </div>
        ) : (
          <p className="text-center text-zinc-400">Seleccioná un briefing</p>
        )}
      </div>
    </div>
  );
}
