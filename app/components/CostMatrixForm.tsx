"use client";

import { useState, useEffect, useCallback } from "react";

type Group = { id: string; name: string };
type Service = { id: string; name: string; group_id: string; group_name: string; base_price: number };

export default function CostMatrixForm({ onSaved }: { onSaved: () => void }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ name: "", group_id: "", base_price: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      ? await fetch(`/api/services/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (!res.ok) { setError((await res.json()).error); return; }

    setForm({ name: "", group_id: "", base_price: "" });
    setEditingId(null);
    loadData();
    onSaved();
  }

  function startEdit(s: Service) {
    setForm({ name: s.name, group_id: s.group_id, base_price: s.base_price.toString() });
    setEditingId(s.id);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    loadData();
    onSaved();
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-[#1e3c72]">
          {editingId ? "Editar Servicio" : "Cargar Servicio"}
        </h2>
      </div>

      <form onSubmit={handleSave} className="px-6 py-4 space-y-3">
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        />
        <select
          value={form.group_id}
          onChange={(e) => setForm({ ...form, group_id: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        >
          <option value="">Seleccionar grupo</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Precio base (Integra 90)"
          value={form.base_price}
          onChange={(e) => setForm({ ...form, base_price: e.target.value })}
          className="w-full rounded-lg border px-3 py-2 text-sm"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
            {editingId ? "Actualizar" : "Guardar"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", group_id: "", base_price: "" }); }} className="rounded-lg border px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de servicios cargados */}
      <div className="border-t px-6 py-4">
        <h3 className="mb-2 text-sm font-medium text-zinc-500">Servicios cargados ({services.length})</h3>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {services.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-zinc-700">{s.name}</span>
                <span className="ml-2 text-xs text-zinc-400">({s.group_name})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#1e3c72]">${s.base_price?.toFixed(2)}</span>
                <button onClick={() => startEdit(s)} className="text-xs text-blue-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
