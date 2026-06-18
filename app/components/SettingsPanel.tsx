// [FEATURE v0.3.0]: SettingsPanel — configuración de estadísticas
"use client";

import { useState, useEffect, useCallback } from "react";
import Toast from "./Toast";
import SectionLabel from "./SectionLabel";

export default function SettingsPanel() {
  const [totalSocios, setTotalSocios] = useState("");
  const [diasInactividad, setDiasInactividad] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ mensaje: "", tipo: "success" as "success" | "error", visible: false });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      setTotalSocios(data.total_socios_padron || "0");
      setDiasInactividad(data.dias_inactividad || "90");
    }
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
