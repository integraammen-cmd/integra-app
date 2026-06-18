// [REFACTOR v0.2.0]: WeeklyCalendar redesign — Integra Mutual brand identity
"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "./Toast";

type Event = {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  category: "salud" | "sociales" | "gremial" | "admin" | "urgente";
  alarm_enabled: boolean;
};

function getWeekDays() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }

function fmtDayShort(d: Date) {
  const weekdays = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  return `${weekdays[d.getDay()]} ${d.getDate()}`;
}

function fmtTime24(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function WeeklyCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start_time: "",
    end_time: "",
    category: "admin" as Event["category"],
    alarm_enabled: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(fmtDate(new Date()));
  const [toast, setToast] = useState<{ mensaje: string; tipo: "success" | "error"; visible: boolean }>({
    mensaje: "",
    tipo: "success",
    visible: false,
  });

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 a 21:00

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const dayEvents = events.filter((e) => fmtDate(new Date(e.start_time)) === selectedDay);

  // Validation
  function validateTime(time: string): string | null {
    if (!time) return null;
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 7 || hour > 21) {
      return "Horario laboral: 7:00 a 21:00";
    }
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate required name
    if (!form.title.trim()) {
      setError("El nombre es requerido");
      return;
    }

    // Validate time range
    const timeErr = validateTime(form.start_time) || (form.end_time ? validateTime(form.end_time) : null);
    if (timeErr) {
      setError(timeErr);
      return;
    }

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const errMsg = (await res.json()).error;
      setError(errMsg);
      setToast({ mensaje: errMsg || "Error al crear evento", tipo: "error", visible: true });
      return;
    }
    setToast({ mensaje: "Evento creado correctamente", tipo: "success", visible: true });
    setShowForm(false);
    setForm({ title: "", start_time: "", end_time: "", category: "admin", alarm_enabled: false });
    loadEvents();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setToast({ mensaje: "Evento eliminado", tipo: "success", visible: true });
    loadEvents();
  }

  function eventAt(day: Date, hour: number): Event[] {
    const dayStr = fmtDate(day);
    return events.filter((e) => {
      const d = new Date(e.start_time);
      return fmtDate(d) === dayStr && d.getHours() === hour;
    });
  }

  const selectedDayDate = new Date(selectedDay + "T00:00:00");

  return (
    <div className="pb-24" style={{ background: "var(--bg-base)" }}>
      <Toast
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-white">
            Semana del {fmtDayShort(weekDays[0])} al {fmtDayShort(weekDays[6])}
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("es-AR", { year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 overflow-x-auto px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
        {weekDays.map((d) => {
          const ds = fmtDate(d);
          const isToday = ds === fmtDate(new Date());
          const isSelected = ds === selectedDay;
          return (
            <button
              key={ds}
              onClick={() => setSelectedDay(ds)}
              className="flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all min-w-[56px] text-center"
              style={{
                background: isSelected
                  ? "var(--accent-green)"
                  : isToday
                  ? "var(--bg-card-hover)"
                  : "var(--bg-card)",
                color: isSelected ? "#0A1A0A" : isToday ? "#fff" : "var(--text-secondary)",
                border: isToday && !isSelected ? "1px solid var(--accent-green)" : "1px solid transparent",
              }}
            >
              {fmtDayShort(d)}
            </button>
          );
        })}
      </div>

      {/* Hourly grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="w-14 py-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Hora
              </th>
              <th
                className="py-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--accent-green)" }}
              >
                {fmtDayShort(selectedDayDate)}
              </th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => {
              const evts = eventAt(selectedDayDate, h);
              return (
                <tr key={h} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td
                    className="py-3 pr-2 text-right text-xs align-top"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}:00
                  </td>
                  <td className="py-1 px-1 align-top">
                    {evts.length === 0 ? (
                      <div className="py-2 text-xs italic" style={{ color: "var(--text-muted)" }}>
                        —
                      </div>
                    ) : (
                      evts.map((ev) => {
                        const isUrgent = ev.category === "urgente";
                        return (
                          <div
                            key={ev.id}
                            className="mb-1 rounded border px-2 py-1.5 text-xs cursor-pointer group relative"
                            style={{
                              background: isUrgent
                                ? "rgba(255, 92, 92, 0.20)"
                                : "rgba(0, 212, 122, 0.20)",
                              borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}`,
                              borderColor: isUrgent ? "rgba(255,92,92,0.30)" : "rgba(0,212,122,0.30)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{ev.title}</span>
                              {ev.alarm_enabled && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                              )}
                            </div>
                            {ev.end_time && (
                              <div className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                {fmtTime24(ev.start_time)} – {fmtTime24(ev.end_time)}
                              </div>
                            )}
                            <button
                              onClick={() => handleDelete(ev.id)}
                              className="absolute top-0 right-0 -mt-1.5 -mr-1.5 rounded-full w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{ background: "var(--state-error)" }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Day event summary */}
      {dayEvents.length > 0 && (
        <div className="px-4 py-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
          <h3
            className="text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: "var(--accent-green)" }}
          >
            {dayEvents.length} evento{dayEvents.length > 1 ? "s" : ""} el {fmtDayShort(selectedDayDate)}
          </h3>
          {dayEvents.map((ev) => {
            const isUrgent = ev.category === "urgente";
            return (
              <div key={ev.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded"
                style={{ background: "var(--bg-overlay)" }}
              >
                <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>
                  {fmtTime24(ev.start_time)}
                </span>
                {isUrgent && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{ background: "rgba(255,92,92,0.20)", color: "var(--state-error)" }}
                  >
                    Urgente
                  </span>
                )}
                <span className="text-white font-medium">{ev.title}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="fab"
        style={{ bottom: "5rem", right: "1.25rem" }}
      >
        +
      </button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Nuevo Evento</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del evento"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                style={!form.title.trim() && error ? { borderColor: "var(--state-error)" } : undefined}
                autoFocus
              />
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Inicio</label>
                <input
                  type="time"
                  min="07:00"
                  max="21:00"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Fin (opcional)</label>
                <input
                  type="time"
                  min="07:00"
                  max="21:00"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="input-field"
                />
              </div>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Event["category"] })}
                className="input-field"
                style={{ appearance: "auto" }}
              >
                <option value="admin" style={{ background: "#0A0F2E", color: "#fff" }}>Admin</option>
                <option value="salud" style={{ background: "#0A0F2E", color: "#fff" }}>Salud</option>
                <option value="sociales" style={{ background: "#0A0F2E", color: "#fff" }}>Sociales</option>
                <option value="gremial" style={{ background: "#0A0F2E", color: "#fff" }}>Gremial</option>
                <option value="urgente" style={{ background: "#0A0F2E", color: "#fff" }}>Urgente</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.alarm_enabled}
                  onChange={(e) => setForm({ ...form, alarm_enabled: e.target.checked })}
                  className="accent-green-500"
                />
                Activar alarma
              </label>
              {error && (
                <p className="text-sm" style={{ color: "var(--state-error)" }}>{error}</p>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Guardar</button>
                <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

