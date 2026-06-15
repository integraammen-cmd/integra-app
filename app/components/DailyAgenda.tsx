"use client";

import { createClient } from "@/app/lib/supabase-browser";
import { useEffect, useState, useCallback } from "react";

type Event = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  category: "salud" | "sociales" | "gremial" | "admin" | "urgente";
  alarm_enabled: boolean;
  notification_offset: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  salud: "bg-emerald-100 text-emerald-800",
  sociales: "bg-blue-100 text-blue-800",
  gremial: "bg-purple-100 text-purple-800",
  admin: "bg-zinc-100 text-zinc-800",
  urgente: "bg-red-100 text-red-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  salud: "Salud",
  sociales: "Sociales",
  gremial: "Gremial",
  admin: "Admin",
  urgente: "Urgente",
};

export default function DailyAgenda() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>("todas");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    category: "admin" as Event["category"],
    alarm_enabled: false,
  });
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
  }, []);

  useEffect(() => {
    loadEvents();

    // Tiempo real vía Supabase Realtime
    const channel = supabase
      .channel("events-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => loadEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEvents, supabase]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const err = await res.json();
      setError(err.error);
      return;
    }
    setShowForm(false);
    setForm({ title: "", description: "", start_time: "", end_time: "", category: "admin", alarm_enabled: false });
    loadEvents();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    loadEvents();
  }

  const filteredEvents =
    filter === "todas" ? events : events.filter((e) => e.category === filter);

  // Agrupar por franja horaria
  const grouped = filteredEvents.reduce<Record<string, Event[]>>((acc, event) => {
    const hour = new Date(event.start_time).getHours();
    const key = `${hour.toString().padStart(2, "0")}:00`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  const sortedHours = Object.keys(grouped).sort();

  return (
    <div className="rounded-xl bg-zinc-800/50 border border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Agenda Diaria</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
        >
          + Nuevo Evento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 px-6 py-3 border-b border-zinc-700 overflow-x-auto">
        {["todas", "salud", "sociales", "gremial", "admin", "urgente"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === cat
                ? "bg-[#1e3c72] text-white"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            {cat === "todas" ? "Todas" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleCreate} className="border-b border-zinc-700 bg-zinc-800/30 px-6 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400"
              required
            />
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Event["category"] })}
              className="rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.alarm_enabled}
                onChange={(e) => setForm({ ...form, alarm_enabled: e.target.checked })}
                className="rounded"
              />
              Activar alarma
            </label>
            <button
              type="submit"
              className="rounded-lg bg-[#1e3c72] px-4 py-2 text-sm font-medium text-white hover:bg-blue-900 transition-colors"
            >
              Guardar
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </form>
      )}

      {/* Agenda cronológica */}
      <div className="p-6">
        {sortedHours.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">Sin eventos para mostrar</p>
        ) : (
          <div className="space-y-6">
            {sortedHours.map((hour) => (
              <div key={hour}>
                <h3 className="mb-2 text-sm font-medium text-zinc-500">{hour}</h3>
                <div className="space-y-2">
                  {grouped[hour].map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 hover:border-zinc-600 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[event.category]}`}
                        >
                          {CATEGORY_LABELS[event.category]}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-zinc-200">{event.title}</p>
                            {event.alarm_enabled && (
                              <span title="Alarma activada">🔔</span>
                            )}
                          </div>
                          {event.description && (
                            <p className="mt-0.5 text-xs text-zinc-400">{event.description}</p>
                          )}
                          <p className="mt-1 text-xs text-zinc-500">
                            {new Date(event.start_time).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {event.end_time &&
                              ` — ${new Date(event.end_time).toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
