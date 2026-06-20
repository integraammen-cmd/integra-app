// [FEATURE v0.3.0]: SettingsPanel — configuración de estadísticas
// [FIX v0.2.4]: Sección Descuentos por grupo editable
"use client";

import { useState, useEffect, useCallback } from "react";
import Toast from "./Toast";
import SectionLabel from "./SectionLabel";

type GroupDiscount = {
  id: string;
  group_id: string;
  tipo_socio: string;
  descuento_porcentaje: number;
};

type Group = { id: string; name: string };

const TIPOS_SOCIO = ["Activo", "Integra 90", "Integra 180", "Integra 360", "Integra 360 Plus"];

export default function SettingsPanel() {
  const [totalSocios, setTotalSocios] = useState("");
  const [diasInactividad, setDiasInactividad] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" as "success" | "error", visible: false });

  // [FIX v0.2.4]: Estado para descuentos por grupo
  const [groups, setGroups] = useState<Group[]>([]);
  const [discounts, setDiscounts] = useState<GroupDiscount[]>([]);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [settingsRes, groupsRes, discountsRes] = await Promise.all([
      fetch("/api/settings"),
      fetch("/api/groups"),
      fetch("/api/group-discounts").catch(() => null),
    ]);

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      setTotalSocios(data.total_socios_padron || "0");
      setDiasInactividad(data.dias_inactividad || "90");
    }
    if (groupsRes.ok) setGroups(await groupsRes.json());
    if (discountsRes && discountsRes.ok) setDiscounts(await discountsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(key: string, value: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setToast({ mensaje: "Configuración guardada", tipo: "success", visible: true });
    } catch {
      setToast({ mensaje: "Error al guardar", tipo: "error", visible: true });
    }
    setSaving(false);
  }

  // [FIX v0.2.4]: Guardar descuento de un grupo
  async function saveDiscount(groupId: string, tipoSocio: string, porcentaje: number) {
    setSavingGroup(groupId);
    try {
      const res = await fetch("/api/group-discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: groupId, tipo_socio: tipoSocio, descuento_porcentaje: porcentaje }),
      });
      if (!res.ok) throw new Error("Error");
      // Actualizar estado local
      setDiscounts((prev) => {
        const filtered = prev.filter((d) => !(d.group_id === groupId && d.tipo_socio === tipoSocio));
        return [...filtered, { id: "", group_id: groupId, tipo_socio: tipoSocio, descuento_porcentaje: porcentaje }];
      });
      setToast({ mensaje: "Descuento guardado", tipo: "success", visible: true });
    } catch {
      setToast({ mensaje: "Error al guardar descuento", tipo: "error", visible: true });
    }
    setSavingGroup(null);
  }

  // [FIX v0.2.4]: Obtener descuento actual para un grupo + tipo
  function getDiscount(groupId: string, tipoSocio: string): number {
    const found = discounts.find((d) => d.group_id === groupId && d.tipo_socio === tipoSocio);
    return found?.descuento_porcentaje ?? 0;
  }

  if (loading) {
    return (
      <div className="card">
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <>
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} visible={toast.visible} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      {/* [FIX v0.2.4]: Sección Descuentos por grupo */}
      <div className="card space-y-4">
        <SectionLabel texto="DESCUENTOS POR GRUPO" />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Cada grupo de servicio puede tener sus propios porcentajes de descuento. El precio base (Integra 90) no tiene descuento.
        </p>

        {groups.map((group) => (
          <div
            key={group.id}
            className="p-4 rounded-xl"
            style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}
          >
            <h4 className="text-sm font-semibold text-white mb-3">{group.name}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TIPOS_SOCIO.map((tipo) => {
                const currentVal = getDiscount(group.id, tipo);
                return (
                  <div key={tipo} className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                      {tipo === "Integra 90" ? "I.90" : tipo === "Integra 180" ? "I.180" : tipo === "Integra 360" ? "I.360" : tipo === "Integra 360 Plus" ? "I.360+" : tipo}
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={currentVal}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0 && val <= 100 && val !== currentVal) {
                            saveDiscount(group.id, tipo, val);
                          }
                        }}
                        className="input-field flex-1 text-xs text-center"
                        style={{ padding: "6px 4px" }}
                        placeholder="0"
                      />
                      <span className="self-center text-xs" style={{ color: "var(--text-muted)" }}>%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {savingGroup === group.id && (
              <p className="text-xs mt-2" style={{ color: "var(--accent-green)" }}>Guardando...</p>
            )}
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <SectionLabel texto="CONFIGURACIÓN DE ESTADÍSTICAS" />

        {/* Total de socios del padrón */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-1.5 block">
            Total de socios del padrón
          </label>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            Se usa para calcular el % de socios que accedieron a servicios.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={totalSocios}
              onChange={(e) => setTotalSocios(e.target.value)}
              className="input-field flex-1"
              placeholder="0"
            />
            <button
              onClick={() => save("total_socios_padron", totalSocios)}
              disabled={saving}
              className="btn-primary text-sm"
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Días de inactividad */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-1.5 block">
            Período de inactividad (días)
          </label>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            Días sin uso para considerar a un socio inactivo. Default: 90.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={diasInactividad}
              onChange={(e) => setDiasInactividad(e.target.value)}
              className="input-field flex-1"
              placeholder="90"
            />
            <button
              onClick={() => save("dias_inactividad", diasInactividad)}
              disabled={saving}
              className="btn-primary text-sm"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
