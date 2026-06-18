// [FIX v0.2.3]: WeeklyCalendar — bloques visuales, toggle semanal/diario, timezone fix
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

function fmtDayLong(d: Date) {
  const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${weekdays[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

function fmtTime24(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// [FIX v0.2.3]: timezone fix — convertir UTC a Argentina (UTC-3)
const toArgentinaDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const argDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return argDate.toISOString().split("T")[0];
};

const toArgentinaHour = (timestamp: string) => {
  const date = new Date(timestamp);
  const argDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return argDate.getUTCHours();
};

const toArgentinaMinutes = (timestamp: string) => {
  const date = new Date(timestamp);
  const argDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return argDate.getUTCMinutes();
};

const HOUR_HEIGHT = 60;
const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function getEventTop(startTime: string) {
  const h = toArgentinaHour(startTime);
  const m = toArgentinaMinutes(startTime);
  return (h - START_HOUR) * HOUR_HEIGHT + (m * HOUR_HEIGHT / 60);
}

function getEventHeight(startTime: string, endTime?: string | null) {
  if (!endTime) return HOUR_HEIGHT;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMinutes = (end.getTime() - start.getTime()) / 60000;
  return Math.max(diffMinutes * HOUR_HEIGHT / 60, 20);
}

type ViewMode = "semanal" | "diario";

export default function WeeklyCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start_time: "",
    category: "admin" as Event["category"],
    alarm_enabled: false,
  });
  const [selectedDate, setSelectedDate] = useState<string>(fmtDate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(fmtDate(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>("semanal");
  const [dailyDate, setDailyDate] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ mensaje: string; tipo: "success" | "error"; visible: boolean }>({
    mensaje: "", tipo: "success", visible: false,
  });

  const weekDays = getWeekDays();
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR);

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // [FIX v0.2.3]: timezone-aware filtering
  const dayEvents = events.filter((e) => toArgentinaDate(e.start_time) === selectedDay);
  const dailyViewEvents = events.filter((e) => toArgentinaDate(e.start_time) === fmtDate(dailyDate));

  function validateTime(time: string): string | null {
    if (!time) return null;
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 7 || hour > 21) return "Horario laboral: 7:00 a 21:00";
    return null;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError("El nombre es requerido"); return; }
    const timeErr = validateTime(form.start_time);
    if (timeErr) { setError(timeErr); return; }
    const startTimestamp = `${selectedDate}T${form.start_time}:00-03:00`;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: form.title, start_time: startTimestamp, category: form.category, alarm_enabled: form.alarm_enabled }),
    });
    if (!res.ok) { const errMsg = (await res.json()).error; setError(errMsg); setToast({ mensaje: errMsg || "Error", tipo: "error", visible: true }); return; }
    setToast({ mensaje: "Evento creado", tipo: "success", visible: true });
    setShowForm(false);
    setForm({ title: "", start_time: "", category: "admin", alarm_enabled: false });
    loadEvents();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setToast({ mensaje: "Evento eliminado", tipo: "success", visible: true });
    loadEvents();
  }

  function changeDailyDate(delta: number) {
    const d = new Date(dailyDate);
    d.setDate(d.getDate() + delta);
    setDailyDate(d);
  }

  function goToDay(dateStr: string) {
    setDailyDate(new Date(dateStr + "T00:00:00"));
    setViewMode("diario");
  }

  const selectedDayDate = new Date(selectedDay + "T00:00:00");
  const todayStr = fmtDate(new Date());

  return (
    <div className="pb-24" style={{ background: "var(--bg-base)" }}>
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} visible={toast.visible} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      {/* Header + view toggle */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-bold text-white">
            {viewMode === "semanal" ? `Semana del ${fmtDayShort(weekDays[0])} al ${fmtDayShort(weekDays[6])}` : fmtDayLong(dailyDate)}
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date().toLocaleDateString("es-AR", { year: "numeric" })}</span>
        </div>
        {/* Toggle pills */}
        <div className="flex gap-1">
          {(["semanal", "diario"] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all capitalize"
              style={{
                background: viewMode === m ? "var(--accent-green)" : "var(--bg-card)",
                color: viewMode === m ? "#0A1A0A" : "var(--text-secondary)",
              }}
            >
              {m === "semanal" ? "Semana" : "Día"}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly view */}
      {viewMode === "semanal" && (
        <>
          <div className="flex gap-1 overflow-x-auto px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            {weekDays.map((d) => {
              const ds = fmtDate(d);
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDay;
              return (
                <button key={ds}
                  onClick={() => { setSelectedDay(ds); goToDay(ds); }}
                  className="flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all min-w-[56px] text-center"
                  style={{
                    background: isSelected ? "var(--accent-green)" : isToday ? "var(--bg-card-hover)" : "var(--bg-card)",
                    color: isSelected ? "#0A1A0A" : isToday ? "#fff" : "var(--text-secondary)",
                    border: isToday && !isSelected ? "1px solid var(--accent-green)" : "1px solid transparent",
                  }}
                >
                  {fmtDayShort(d)}
                </button>
              );
            })}
          </div>

          {/* Hourly grid — visual blocks */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: "280px" }}>
              {hours.map((h) => {
                const evts = events.filter((e) => {
                  return toArgentinaDate(e.start_time) === selectedDay && toArgentinaHour(e.start_time) === h;
                });
                return (
                  <div key={h} className="flex" style={{ borderBottom: "1px solid var(--border)", height: HOUR_HEIGHT, position: "relative" }}>
                    <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>{h}:00</div>
                    <div className="flex-1 relative" style={{ borderLeft: "1px solid var(--border)" }}>
                      {evts.map((ev) => {
                        const top = getEventTop(ev.start_time) - (h - START_HOUR) * HOUR_HEIGHT;
                        const height = getEventHeight(ev.start_time, ev.end_time);
                        const isUrgent = ev.category === "urgente";
                        return (
                          <div key={ev.id}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer group overflow-hidden"
                            style={{
                              top: `${top}px`, height: `${Math.min(height, HOUR_HEIGHT * 3)}px`,
                              background: isUrgent ? "rgba(239, 68, 68, 0.20)" : "rgba(0, 212, 122, 0.20)",
                              borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}`,
                              color: "var(--text-primary)", zIndex: 5,
                            }}
                            title={`${ev.title} (${fmtTime24(ev.start_time)}${ev.end_time ? " – " + fmtTime24(ev.end_time) : ""})`}
                          >
                            <span className="font-medium">{ev.title}</span>
                            <button onClick={() => handleDelete(ev.id)}
                              className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{ background: "var(--state-error)" }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {dayEvents.length > 0 && (
            <div className="px-4 py-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
                {dayEvents.length} evento{dayEvents.length > 1 ? "s" : ""} el {fmtDayShort(selectedDayDate)}
              </h3>
              {dayEvents.map((ev) => {
                const isUrgent = ev.category === "urgente";
                return (
                  <div key={ev.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded" style={{ background: "var(--bg-overlay)" }}>
                    <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>{fmtTime24(ev.start_time)}</span>
                    {isUrgent && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "rgba(255,92,92,0.20)", color: "var(--state-error)" }}>Urgente</span>}
                    <span className="text-white font-medium">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Daily view */}
      {viewMode === "diario" && (
        <>
          {/* Nav arrows */}
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => changeDailyDate(-1)} className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-medium text-white">{fmtDayLong(dailyDate)}</span>
            <button onClick={() => changeDailyDate(1)} className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Hourly grid — daily */}
          <div className="overflow-x-auto">
            <div style={{ minWidth: "280px" }}>
              {hours.map((h) => {
                const dailyDateStr = fmtDate(dailyDate);
                const evts = events.filter((e) => {
                  return toArgentinaDate(e.start_time) === dailyDateStr && toArgentinaHour(e.start_time) === h;
                });
                return (
                  <div key={h} className="flex" style={{ borderBottom: "1px solid var(--border)", height: HOUR_HEIGHT, position: "relative" }}>
                    <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>{h}:00</div>
                    <div className="flex-1 relative" style={{ borderLeft: "1px solid var(--border)" }}>
                      {evts.map((ev) => {
                        const top = getEventTop(ev.start_time) - (h - START_HOUR) * HOUR_HEIGHT;
                        const height = getEventHeight(ev.start_time, ev.end_time);
                        const isUrgent = ev.category === "urgente";
                        return (
                          <div key={ev.id}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer group overflow-hidden"
                            style={{
                              top: `${top}px`, height: `${Math.min(height, HOUR_HEIGHT * 3)}px`,
                              background: isUrgent ? "rgba(239, 68, 68, 0.20)" : "rgba(0, 212, 122, 0.20)",
                              borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}`,
                              color: "var(--text-primary)", zIndex: 5,
                            }}
                            title={`${ev.title} (${fmtTime24(ev.start_time)}${ev.end_time ? " – " + fmtTime24(ev.end_time) : ""})`}
                          >
                            <span className="font-medium">{ev.title}</span>
                            <button onClick={() => handleDelete(ev.id)}
                              className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{ background: "var(--state-error)" }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {dailyViewEvents.length > 0 && (
            <div className="px-4 py-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
                {dailyViewEvents.length} evento{dailyViewEvents.length > 1 ? "s" : ""} el {fmtDayShort(dailyDate)}
              </h3>
              {dailyViewEvents.map((ev) => {
                const isUrgent = ev.category === "urgente";
                return (
                  <div key={ev.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded" style={{ background: "var(--bg-overlay)" }}>
                    <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>{fmtTime24(ev.start_time)}</span>
                    {isUrgent && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "rgba(255,92,92,0.20)", color: "var(--state-error)" }}>Urgente</span>}
                    <span className="text-white font-medium">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <button onClick={() => { setSelectedDate(viewMode === "semanal" ? selectedDay : fmtDate(dailyDate)); setShowForm(!showForm); }}
        className="fab" style={{ bottom: "5rem", right: "1.25rem" }}>+</button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Nuevo Evento</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Nombre del evento" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" autoFocus
                style={!form.title.trim() && error ? { borderColor: "var(--state-error)" } : undefined} />
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Fecha</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", padding: "12px 16px" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Hora</label>
                <input type="time" min="07:00" max="21:00" value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="input-field" />
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Event["category"] })}
                className="input-field" style={{ appearance: "auto" }}>
                <option value="admin" style={{ background: "#0A0F2E", color: "#fff" }}>Admin</option>
                <option value="salud" style={{ background: "#0A0F2E", color: "#fff" }}>Salud</option>
                <option value="sociales" style={{ background: "#0A0F2E", color: "#fff" }}>Sociales</option>
                <option value="gremial" style={{ background: "#0A0F2E", color: "#fff" }}>Gremial</option>
                <option value="urgente" style={{ background: "#0A0F2E", color: "#fff" }}>Urgente</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={form.alarm_enabled} onChange={(e) => setForm({ ...form, alarm_enabled: e.target.checked })} />
                Activar alarma
              </label>
              {error && <p className="text-sm" style={{ color: "var(--state-error)" }}>{error}</p>}
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


  const dayEvents = events.filter((e) => fmtDate(new Date(e.start_time)) === selectedDay);

  // [FIX v0.2.2]: validación solo para start_time (sin end_time)
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

    if (!form.title.trim()) {
      setError("El nombre es requerido");
      return;
    }

    const timeErr = validateTime(form.start_time);
    if (timeErr) {
      setError(timeErr);
      return;
    }

    // [FIX v0.2.2]: construir timestamp completo con fecha + hora + tz
    const startTimestamp = `${selectedDate}T${form.start_time}:00-03:00`;

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        start_time: startTimestamp,
        category: form.category,
        alarm_enabled: form.alarm_enabled,
      }),
    });
    if (!res.ok) {
      const errMsg = (await res.json()).error;
      setError(errMsg);
      setToast({ mensaje: errMsg || "Error al crear evento", tipo: "error", visible: true });
      return;
    }
    setToast({ mensaje: "Evento creado correctamente", tipo: "success", visible: true });
    setShowForm(false);
    setForm({ title: "", start_time: "", category: "admin", alarm_enabled: false });
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
  const todayStr = fmtDate(new Date());

  return (
    <div className="pb-24" style={{ background: "var(--bg-base)" }}>
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} visible={toast.visible} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      {/* Header + view toggle */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-bold text-white">
            {viewMode === "semanal" ? `Semana del ${fmtDayShort(weekDays[0])} al ${fmtDayShort(weekDays[6])}` : fmtDayLong(dailyDate)}
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date().toLocaleDateString("es-AR", { year: "numeric" })}</span>
        </div>
        <div className="flex gap-1">
          {(["semanal", "diario"] as ViewMode[]).map((m) => (
            <button key={m} onClick={() => setViewMode(m)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all capitalize"
              style={{ background: viewMode === m ? "var(--accent-green)" : "var(--bg-card)", color: viewMode === m ? "#0A1A0A" : "var(--text-secondary)" }}
            >
              {m === "semanal" ? "Semana" : "Día"}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly view */}
      {viewMode === "semanal" && (
        <>
          <div className="flex gap-1 overflow-x-auto px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            {weekDays.map((d) => {
              const ds = fmtDate(d);
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDay;
              return (
                <button key={ds} onClick={() => { setSelectedDay(ds); goToDay(ds); }}
                  className="flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all min-w-[56px] text-center"
                  style={{ background: isSelected ? "var(--accent-green)" : isToday ? "var(--bg-card-hover)" : "var(--bg-card)", color: isSelected ? "#0A1A0A" : isToday ? "#fff" : "var(--text-secondary)", border: isToday && !isSelected ? "1px solid var(--accent-green)" : "1px solid transparent" }}
                >
                  {fmtDayShort(d)}
                </button>
              );
            })}
          </div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: "280px" }}>
              {hours.map((h) => {
                const evts = events.filter((e) => toArgentinaDate(e.start_time) === selectedDay && toArgentinaHour(e.start_time) === h);
                return (
                  <div key={h} className="flex" style={{ borderBottom: "1px solid var(--border)", height: HOUR_HEIGHT, position: "relative" }}>
                    <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>{h}:00</div>
                    <div className="flex-1 relative" style={{ borderLeft: "1px solid var(--border)" }}>
                      {evts.map((ev) => {
                        const top = getEventTop(ev.start_time) - (h - START_HOUR) * HOUR_HEIGHT;
                        const height = getEventHeight(ev.start_time, ev.end_time);
                        const isUrgent = ev.category === "urgente";
                        return (
                          <div key={ev.id} className="absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer group overflow-hidden"
                            style={{ top: `${top}px`, height: `${Math.min(height, HOUR_HEIGHT * 3)}px`, background: isUrgent ? "rgba(239, 68, 68, 0.20)" : "rgba(0, 212, 122, 0.20)", borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}`, color: "var(--text-primary)", zIndex: 5 }}
                            title={`${ev.title} (${fmtTime24(ev.start_time)}${ev.end_time ? " – " + fmtTime24(ev.end_time) : ""})`}
                          >
                            <span className="font-medium">{ev.title}</span>
                            <button onClick={() => handleDelete(ev.id)} className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{ background: "var(--state-error)" }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {dayEvents.length > 0 && (
            <div className="px-4 py-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
                {dayEvents.length} evento{dayEvents.length > 1 ? "s" : ""} el {fmtDayShort(selectedDayDate)}
              </h3>
              {dayEvents.map((ev) => {
                const isUrgent = ev.category === "urgente";
                return (
                  <div key={ev.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded" style={{ background: "var(--bg-overlay)" }}>
                    <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>{fmtTime24(ev.start_time)}</span>
                    {isUrgent && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "rgba(255,92,92,0.20)", color: "var(--state-error)" }}>Urgente</span>}
                    <span className="text-white font-medium">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Daily view */}
      {viewMode === "diario" && (
        <>
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => changeDailyDate(-1)} className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-medium text-white">{fmtDayLong(dailyDate)}</span>
            <button onClick={() => changeDailyDate(1)} className="p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: "280px" }}>
              {hours.map((h) => {
                const dailyDateStr = fmtDate(dailyDate);
                const evts = events.filter((e) => toArgentinaDate(e.start_time) === dailyDateStr && toArgentinaHour(e.start_time) === h);
                return (
                  <div key={h} className="flex" style={{ borderBottom: "1px solid var(--border)", height: HOUR_HEIGHT, position: "relative" }}>
                    <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>{h}:00</div>
                    <div className="flex-1 relative" style={{ borderLeft: "1px solid var(--border)" }}>
                      {evts.map((ev) => {
                        const top = getEventTop(ev.start_time) - (h - START_HOUR) * HOUR_HEIGHT;
                        const height = getEventHeight(ev.start_time, ev.end_time);
                        const isUrgent = ev.category === "urgente";
                        return (
                          <div key={ev.id} className="absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer group overflow-hidden"
                            style={{ top: `${top}px`, height: `${Math.min(height, HOUR_HEIGHT * 3)}px`, background: isUrgent ? "rgba(239, 68, 68, 0.20)" : "rgba(0, 212, 122, 0.20)", borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}`, color: "var(--text-primary)", zIndex: 5 }}
                            title={`${ev.title} (${fmtTime24(ev.start_time)}${ev.end_time ? " – " + fmtTime24(ev.end_time) : ""})`}
                          >
                            <span className="font-medium">{ev.title}</span>
                            <button onClick={() => handleDelete(ev.id)} className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              style={{ background: "var(--state-error)" }}>×</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {dailyViewEvents.length > 0 && (
            <div className="px-4 py-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
                {dailyViewEvents.length} evento{dailyViewEvents.length > 1 ? "s" : ""} el {fmtDayShort(dailyDate)}
              </h3>
              {dailyViewEvents.map((ev) => {
                const isUrgent = ev.category === "urgente";
                return (
                  <div key={ev.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded" style={{ background: "var(--bg-overlay)" }}>
                    <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>{fmtTime24(ev.start_time)}</span>
                    {isUrgent && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "rgba(255,92,92,0.20)", color: "var(--state-error)" }}>Urgente</span>}
                    <span className="text-white font-medium">{ev.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <button onClick={() => { setSelectedDate(viewMode === "semanal" ? selectedDay : fmtDate(dailyDate)); setShowForm(!showForm); }}
        className="fab" style={{ bottom: "5rem", right: "1.25rem" }}>+</button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="card w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Nuevo Evento</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Nombre del evento" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" autoFocus
                style={!form.title.trim() && error ? { borderColor: "var(--state-error)" } : undefined} />
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Fecha</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", padding: "12px 16px" }} />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Hora</label>
                <input type="time" min="07:00" max="21:00" value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="input-field" />
              </div>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Event["category"] })}
                className="input-field" style={{ appearance: "auto" }}>
                <option value="admin" style={{ background: "#0A0F2E", color: "#fff" }}>Admin</option>
                <option value="salud" style={{ background: "#0A0F2E", color: "#fff" }}>Salud</option>
                <option value="sociales" style={{ background: "#0A0F2E", color: "#fff" }}>Sociales</option>
                <option value="gremial" style={{ background: "#0A0F2E", color: "#fff" }}>Gremial</option>
                <option value="urgente" style={{ background: "#0A0F2E", color: "#fff" }}>Urgente</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={form.alarm_enabled} onChange={(e) => setForm({ ...form, alarm_enabled: e.target.checked })} />
                Activar alarma
              </label>
              {error && <p className="text-sm" style={{ color: "var(--state-error)" }}>{error}</p>}
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