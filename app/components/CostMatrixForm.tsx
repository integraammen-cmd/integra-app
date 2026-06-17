// [REFACTOR v0.2.0]: CostMatrixForm redesign — Integra Mutual brand identity
"use client";

import { useState, useEffect, useCallback } from "react";
import Toast from "./Toast";

type Group = { id: string; name: string };
type Service = { id: string; name: string; group_id: string; group_name: string; base_price: number };

export default function CostMatrixForm({ onSaved }: { onSaved: () => void }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: "", group_id: "", base_price: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ mensaje: string; tipo: "success" | "error"; visible: boolean }>({
    mensaje: "",
    tipo: "success",
    visible: false,
  });

  const loadData = useCallback(async () => {
    const [gRes, sRes] = await Promise.all([
      fetch("/api/groups"),
      fetch("/api/services"),
    ]);
    if (gRes.ok) setGroups(await gRes.json());
    if (sRes.ok) setServices(await sRes.json());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = { name: form.name, group_id: form.group_id, base_price: parseFloat(form.base_price) };

    const res = editingId
      ? await fetch(`/api/services/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const errMsg = (await res.json()).error;
      setError(errMsg);
      setToast({ mensaje: errMsg || "Error al guardar", tipo: "error", visible: true });
      return;
    }

    setToast({
      mensaje: editingId ? "Servicio actualizado correctamente" : "Servicio creado correctamente",
      tipo: "success",
      visible: true,
    });
    setForm({ name: "", group_id: "", base_price: "" });
    setEditingId(null);
    loadData();
    onSaved();
  }

  function startEdit(s: Service) {
    setForm({ name: s.name, group_id: s.group_id, base_price: s.base_price.toString() });
    setEditingId(s.id);
    setError(null);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    setToast({ mensaje: "Servicio eliminado", tipo: "success", visible: true });
    loadData();
    onSaved();
  }

  const filteredServices = searchTerm
    ? services.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : services;

  return (
    <div className="space-y-4">
      <Toast
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Formulario */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">
          {editingId ? "Editar Servicio" : "Cargar Servicio"}
        </h2>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            required
          />
          <select
            value={form.group_id}
            onChange={(e) => setForm({ ...form, group_id: e.target.value })}
            className="input-field"
            style={{ appearance: "auto" }}
            required
          >
            <option value="" style={{ background: "#1E35CC", color: "#fff" }}>
              Seleccionar grupo
            </option>
            {groups.map((g) => (
              <option key={g.id} value={g.id} style={{ background: "#1E35CC", color: "#fff" }}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Precio base con tooltip */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-white/80 mb-1.5">
              Precio base — Plan Integra 90
              <span
                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] cursor-help"
                style={{ background: "var(--bg-overlay)", color: "var(--text-muted)" }}
                title="Precio sin descuento. Los demás planes se calculan automáticamente."
              >
                ?
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              className="input-field"
              required
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--state-error)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? "Actualizar" : "Guardar"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", group_id: "", base_price: "" });
                  setError(null);
                }}
                className="btn-ghost"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de servicios cargados */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white/70 mb-3">
          Servicios cargados ({services.length})
        </h3>

        {/* Buscador */}
        <div className="relative mb-3">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {filteredServices.length === 0 ? (
            <p className="text-center text-sm py-4" style={{ color: "var(--text-muted)" }}>
              {searchTerm ? "Sin resultados" : "No hay servicios cargados"}
            </p>
          ) : (
            filteredServices.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: "var(--bg-overlay)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {s.name}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    {s.group_name}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--accent-green)" }}
                  >
                    ${s.base_price?.toFixed(2)}
                  </span>
                  <button
                    onClick={() => startEdit(s)}
                    className="text-xs hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

