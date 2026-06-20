// [FIX v0.2.5]: Calendario simplificado — sin categorías, todo "reunión", edición inline
"use client";

import { useEffect, useState, useCallback } from "react";
import Toast from "./Toast";

type Event = {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
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
  const wd = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  return `${wd[d.getDay()]} ${d.getDate()}`;
}

function fmtDayLong(d: Date) {
  const wd = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${wd[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

function fmtTime24(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const toArgentinaDate = (timestamp: string) => {
  const d = new Date(timestamp);
  const a = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return a.toISOString().split("T")[0];
};

const toArgentinaHour = (timestamp: string) => {
  const d = new Date(timestamp);
  const a = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return a.getUTCHours();
};

const toArgentinaMinutes = (timestamp: string) => {
  const d = new Date(timestamp);
  const a = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return a.getUTCMinutes();
};

const HOUR_HEIGHT = 60;
const START_HOUR = 7;
const TOTAL_HOURS = 14;

function getEventTop(startTime: string) {
  const h = toArgentinaHour(startTime);
  const m = toArgentinaMinutes(startTime);
  return (h - START_HOUR) * HOUR_HEIGHT + (m * HOUR_HEIGHT) / 60;
}

function getEventHeight(startTime: string, endTime?: string | null) {
  if (!endTime) return HOUR_HEIGHT;
  const diff = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000;
  return Math.max(diff * (HOUR_HEIGHT / 60), 20);
}

type ViewMode = "semanal" | "diario";

export default function WeeklyCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    start_time: "",
    alarm_enabled: false,
  });
  const [selectedDate, setSelectedDate] = useState(fmtDate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(fmtDate(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>("semanal");
  const [dailyDate, setDailyDate] = useState(new Date());
  const [toast, setToast] = useState<{ mensaje: string; tipo: "success" | "error"; visible: boolean }>({
    mensaje: "", tipo: "success", visible: false,
  });

  // [FIX v0.2.5]: Edición de eventos
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({ title: "", date: "", time: "" });

  const weekDays = getWeekDays();
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR);
  const todayStr = fmtDate(new Date());

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const dayEvents = events.filter((e) => toArgentinaDate(e.start_time) === selectedDay);
  const dailyViewEvents = events.filter((e) => toArgentinaDate(e.start_time) === fmtDate(dailyDate));

  function validateTime(time: string): string | null {
    if (!time) return null;
    const h = parseInt(time.split(":")[0], 10);
    if (h < 7 || h > 21) return "Horario laboral: 7:00 a 21:00";
    return null;
  }

  // --- Crear evento ---
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError("El nombre es requerido"); return; }
    const tErr = validateTime(form.start_time);
    if (tErr) { setError(tErr); return; }
    const ts = `${selectedDate}T${form.start_time}:00-03:00`;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // [FIX v0.2.5]: Categoría fija 'admin' — todo es reunión
      body: JSON.stringify({ title: form.title, start_time: ts, category: "admin", alarm_enabled: form.alarm_enabled }),
    });
    if (!res.ok) {
      const msg = (await res.json()).error;
      setError(msg);
      setToast({ mensaje: msg || "Error", tipo: "error", visible: true });
      return;
    }
    setToast({ mensaje: "Reunión agendada", tipo: "success", visible: true });
    setShowForm(false);
    setForm({ title: "", start_time: "", alarm_enabled: false });
    loadEvents();
  }

  // --- Eliminar evento ---
  async function handleDelete(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setToast({ mensaje: "Reunión eliminada", tipo: "success", visible: true });
    setEditingEvent(null);
    loadEvents();
  }

  // --- Editar evento ---
  function openEdit(ev: Event) {
    const fecha = toArgentinaDate(ev.start_time);
    const hora = fmtTime24(ev.start_time);
    setEditingEvent(ev);
    setEditForm({ title: ev.title, date: fecha, time: hora });
    setError(null);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    const tErr = validateTime(editForm.time);
    if (tErr) { setError(tErr); return; }
    const ts = `${editForm.date}T${editForm.time}:00-03:00`;
    const res = await fetch(`/api/events/${editingEvent!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editForm.title, start_time: ts }),
    });
    if (!res.ok) {
      setToast({ mensaje: "Error al editar", tipo: "error", visible: true });
      return;
    }
    setToast({ mensaje: "Reunión actualizada", tipo: "success", visible: true });
    setEditingEvent(null);
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

  return (
    <div className="pb-24" style={{ background: "var(--bg-base)" }}>
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} visible={toast.visible} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      {/* Header + toggle pills */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-bold text-white">
            {viewMode === "semanal"
              ? `Semana del ${fmtDayShort(weekDays[0])} al ${fmtDayShort(weekDays[6])}`
              : fmtDayLong(dailyDate)}
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("es-AR", { year: "numeric" })}
          </span>
        </div>
        {/* [FIX v0.2.4]: Toggle pills estilo unificado */}
        <div className="flex gap-2.5">
          {(["semanal", "diario"] as ViewMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s", minWidth: 100, textAlign: "center",
                background: viewMode === m ? "var(--accent-green)" : "var(--bg-card)",
                color: viewMode === m ? "#0A1A0A" : "var(--text-secondary)",
                border: viewMode === m ? "none" : "1px solid var(--border)",
              }}
            >
              {m === "semanal" ? "Semana" : "Día"}
            </button>
          ))}
        </div>
      </div>

      {/* SEMANAL */}
      {viewMode === "semanal" && (
        <>
          <div className="flex gap-1 overflow-x-auto px-3 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            {weekDays.map((d) => {
              const ds = fmtDate(d);
              const isToday = ds === todayStr;
              const isSelected = ds === selectedDay;
              return (
                <button
                  key={ds}
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

          <div className="overflow-x-auto">
            <div style={{ minWidth: "280px" }}>
              {hours.map((h) => {
                const evts = events.filter(
                  (e) => toArgentinaDate(e.start_time) === selectedDay && toArgentinaHour(e.start_time) === h
                );
                return (
                  <div key={h} className="flex" style={{ borderBottom: "1px solid var(--border)", height: HOUR_HEIGHT, position: "relative" }}>
                    <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                      {h}:00
                    </div>
                    <div className="flex-1 relative" style={{ borderLeft: "1px solid var(--border)" }}>
                      {evts.map((ev) => {
                        const top = getEventTop(ev.start_time) - (h - START_HOUR) * HOUR_HEIGHT;
                        const hgt = getEventHeight(ev.start_time, ev.end_time);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => openEdit(ev)}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer group overflow-hidden"
                            style={{
                              top, height: Math.min(hgt, HOUR_HEIGHT * 3),
                              background: "rgba(0,212,122,0.20)",
                              borderLeft: "3px solid var(--accent-green)",
                              color: "var(--text-primary)", zIndex: 5,
                            }}
                          >
                            <span className="font-medium">{ev.title}</span>
                            {ev.alarm_enabled && <span className="ml-1">🔔</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de eventos del día seleccionado */}
          {dayEvents.length > 0 && (
            <div className="px-4 py-3 space-y-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--accent-green)" }}>
                {dayEvents.length} reunión{dayEvents.length > 1 ? "es" : ""} el {fmtDayShort(selectedDayDate)}
              </h3>
              {dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openEdit(ev)}
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded cursor-pointer"
                  style={{ background: "var(--bg-overlay)" }}
                >
                  <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>{fmtTime24(ev.start_time)}</span>
                  <span className="text-white font-medium">{ev.title}</span>
                  {ev.alarm_enabled && <span>🔔</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* DIARIO */}
      {viewMode === "diario" && (
        <>
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
            <button onClick={() => changeDailyDate(-1)} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-sm font-medium text-white">{fmtDayLong(dailyDate)}</span>
            <button onClick={() => changeDailyDate(1)} className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: "280px" }}>
              {hours.map((h) => {
                const dStr = fmtDate(dailyDate);
                const evts = events.filter(
                  (e) => toArgentinaDate(e.start_time) === dStr && toArgentinaHour(e.start_time) === h
                );
                return (
                  <div key={h} className="flex" style={{ borderBottom: "1px solid var(--border)", height: HOUR_HEIGHT, position: "relative" }}>
                    <div className="w-14 flex-shrink-0 py-1 pr-2 text-right text-xs" style={{ color: "var(--text-muted)" }}>
                      {h}:00
                    </div>
                    <div className="flex-1 relative" style={{ borderLeft: "1px solid var(--border)" }}>
                      {evts.map((ev) => {
                        const top = getEventTop(ev.start_time) - (h - START_HOUR) * HOUR_HEIGHT;
                        const hgt = getEventHeight(ev.start_time, ev.end_time);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => openEdit(ev)}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1 text-[11px] cursor-pointer group overflow-hidden"
                            style={{
                              top, height: Math.min(hgt, HOUR_HEIGHT * 3),
                              background: "rgba(0,212,122,0.20)",
                              borderLeft: "3px solid var(--accent-green)",
                              color: "var(--text-primary)", zIndex: 5,
                            }}
                          >
                            <span className="font-medium">{ev.title}</span>
                            {ev.alarm_enabled && <span className="ml-1">🔔</span>}
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
                {dailyViewEvents.length} reunión{dailyViewEvents.length > 1 ? "es" : ""} el {fmtDayShort(dailyDate)}
              </h3>
              {dailyViewEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => openEdit(ev)}
                  className="flex items-center gap-2 text-xs py-1.5 px-2 rounded cursor-pointer"
                  style={{ background: "var(--bg-overlay)" }}
                >
                  <span className="w-12 font-medium" style={{ color: "var(--accent-green)" }}>{fmtTime24(ev.start_time)}</span>
                  <span className="text-white font-medium">{ev.title}</span>
                  {ev.alarm_enabled && <span>🔔</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* FAB */}
      <button
        onClick={() => {
          setSelectedDate(viewMode === "semanal" ? selectedDay : fmtDate(dailyDate));
          setShowForm(!showForm);
          setError(null);
        }}
        className="fab"
        style={{ bottom: "5rem", right: "1.25rem" }}
      >+</button>

      {/* Modal: NUEVA reunión */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowForm(false)}>
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Nueva Reunión</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text" placeholder="Nombre de la reunión" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field" autoFocus
              />
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Fecha</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", padding: "12px 16px" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Hora</label>
                <input type="time" min="07:00" max="21:00" value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="input-field"
                />
              </div>
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

      {/* [FIX v0.2.5]: Modal EDITAR reunión */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setEditingEvent(null)}>
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Editar Reunión</h3>
            <form onSubmit={handleEdit} className="space-y-3">
              <input
                type="text" placeholder="Nombre de la reunión" value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="input-field" autoFocus
              />
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Fecha</label>
                <input type="date" value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="input-field"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--text-primary)", padding: "12px 16px" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Hora</label>
                <input type="time" min="07:00" max="21:00" value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} className="input-field"
                />
              </div>
              {error && <p className="text-sm" style={{ color: "var(--state-error)" }}>{error}</p>}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Guardar cambios</button>
                <button type="button" onClick={() => setEditingEvent(null)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
            {/* Botón eliminar separado */}
            <button
              onClick={() => handleDelete(editingEvent.id)}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: "rgba(239,68,68,0.15)", color: "var(--state-error)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              🗑 Eliminar reunión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
