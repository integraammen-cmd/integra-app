// [FEATURE v0.3.0]: Importador CSV/PDF — Integra Mutual
"use client";

import { useState, useEffect, useCallback } from "react";
import FileDropzone from "../components/FileDropzone";
import Toast from "../components/Toast";

type RegistroImport = {
  socio_codigo: string;
  socio_nombre: string;
  tipo_socio: string;
  servicio_nombre: string;
  service_id: string | null;
  monto_cobrado: number;
  fecha_uso: string;
  estado: "valido" | "advertencia" | "error";
  mensaje: string;
};

type ImportAnterior = {
  id: string;
  archivo_nombre: string;
  fecha_import: string;
  total_registros: number;
  registros_validos: number;
  registros_error: number;
  estado: string;
};

const TIPOS_VALIDOS = ["Activo", "Integra 90", "Integra 180", "Integra 360", "Integra 360 Plus"];

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseFecha(raw: string): string | null {
  // DD/MM/YYYY
  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [_, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // YYYY-MM-DD
  const ymd = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymd) {
    const [_, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

export default function ImportarPage() {
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [registros, setRegistros] = useState<RegistroImport[]>([]);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importsAnteriores, setImportsAnteriores] = useState<ImportAnterior[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [importando, setImportando] = useState(false);
  const [incluirAdvertencias, setIncluirAdvertencias] = useState(false);
  const [detalleImport, setDetalleImport] = useState<string | null>(null);

  const [toast, setToast] = useState({ mensaje: "", tipo: "success" as "success" | "error", visible: false });

  const loadImports = useCallback(async () => {
    const res = await fetch("/api/imports");
    if (res.ok) setImportsAnteriores(await res.json());
  }, []);

  useEffect(() => {
    loadImports();
    fetch("/api/services").then((r) => { if (r.ok) r.json().then(setServices); });
  }, [loadImports]);

  // --- Parseo ---
  async function handleFile(file: File) {
    setProcessing(true);
    setError(null);
    setFileName(file.name);

    try {
      const text = await file.text();

      if (file.name.endsWith(".pdf")) {
        setError("El PDF no tiene un formato tabular legible. Exportá como CSV.");
        setProcessing(false);
        return;
      }

      // Parse CSV
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setError("El archivo no tiene datos. Debe incluir al menos una fila de encabezado y una de datos.");
        setProcessing(false);
        return;
      }

      // Saltar encabezado
      const dataLines = lines.slice(1);
      const parsed: RegistroImport[] = [];

      // Build service lookup map
      const serviceMap = new Map<string, string>();
      services.forEach((s) => serviceMap.set(s.name.toLowerCase().trim(), s.id));

      for (const line of dataLines) {
        const cols = parseCSVLine(line);
        if (cols.length < 6) continue;

        const socio_codigo = cols[0]?.trim() || "";
        const socio_nombre = cols[1]?.trim() || "";
        const tipo_socio = cols[2]?.trim() || "";
        const servicio_nombre = cols[3]?.trim() || "";
        const monto_cobrado = parseFloat(cols[4]?.trim() || "0");
        const fecha_uso = parseFecha(cols[5]?.trim() || "");

        const errors: string[] = [];

        if (!socio_nombre) errors.push("Nombre de socio vacío");
        if (!servicio_nombre) errors.push("Servicio vacío");
        if (!TIPOS_VALIDOS.includes(tipo_socio)) errors.push(`Tipo "${tipo_socio}" no reconocido`);
        if (!fecha_uso) errors.push(`Fecha inválida: "${cols[5]?.trim()}"`);

        // Matching con servicios
        const matchId = serviceMap.get(servicio_nombre.toLowerCase().trim()) || null;

        parsed.push({
          socio_codigo,
          socio_nombre,
          tipo_socio,
          servicio_nombre,
          service_id: matchId,
          monto_cobrado: isNaN(monto_cobrado) ? 0 : monto_cobrado,
          fecha_uso: fecha_uso || "",
          estado: errors.length === 0 ? "valido" : errors.some((e) => e.includes("vacío") || e.includes("inválida")) ? "error" : "advertencia",
          mensaje: errors.join("; ") || "OK",
        });
      }

      setRegistros(parsed);
      setStep("preview");
    } catch {
      setError("Error al leer el archivo. Verificá que sea un CSV válido.");
    }
    setProcessing(false);
  }

  // --- Importar ---
  async function handleImport() {
    setImportando(true);
    const aImportar = registros.filter((r) => r.estado === "valido" || (incluirAdvertencias && r.estado === "advertencia"));

    try {
      const res = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivo_nombre: fileName, registros: aImportar }),
      });
      if (!res.ok) throw new Error((await res.json()).error);

      const data = await res.json();
      setToast({ mensaje: `${data.total} registros importados correctamente`, tipo: "success", visible: true });
      setStep("done");
      loadImports();
    } catch (err: unknown) {
      setToast({ mensaje: err instanceof Error ? err.message : "Error al importar", tipo: "error", visible: true });
    }
    setImportando(false);
  }

  // --- Ver detalle de import anterior ---
  async function verDetalle(id: string) {
    if (detalleImport === id) { setDetalleImport(null); return; }
    setDetalleImport(id);
  }

  async function eliminarImport(id: string) {
    await fetch(`/api/imports?id=${id}`, { method: "DELETE" });
    setToast({ mensaje: "Import eliminado", tipo: "success", visible: true });
    loadImports();
    setDetalleImport(null);
  }

  const validos = registros.filter((r) => r.estado === "valido").length;
  const advertencias = registros.filter((r) => r.estado === "advertencia").length;
  const errores = registros.filter((r) => r.estado === "error").length;

  return (
    <div className="page-container" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <Toast mensaje={toast.mensaje} tipo={toast.tipo} visible={toast.visible} onClose={() => setToast((t) => ({ ...t, visible: false }))} />

      <header style={{ borderBottom: "1px solid var(--border)", padding: "16px 16px 8px 16px", margin: "0 -16px" }}>
        <h1 className="text-[20px] font-bold text-white">Importar Datos</h1>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>CSV con registros de uso</p>
      </header>

      <div className="py-4 space-y-5">
        {/* Paso 1: Upload */}
        <FileDropzone
          onFile={handleFile}
          accept={[".csv", ".txt", ".pdf"]}
          isProcessing={processing}
          error={error}
        />

        {/* Paso 2: Preview */}
        {step === "preview" && registros.length > 0 && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="card">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-white font-semibold">{registros.length}</span>
                  <span className="ml-1" style={{ color: "var(--text-muted)" }}>Total</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: "var(--accent-green)" }}>{validos}</span>
                  <span className="ml-1" style={{ color: "var(--text-muted)" }}>Válidas</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: "var(--state-warning)" }}>{advertencias}</span>
                  <span className="ml-1" style={{ color: "var(--text-muted)" }}>Advertencias</span>
                </div>
                <div>
                  <span className="font-semibold" style={{ color: "var(--state-error)" }}>{errores}</span>
                  <span className="ml-1" style={{ color: "var(--text-muted)" }}>Errores</span>
                </div>
              </div>
            </div>

            {/* Tabla preview (primeras 10) */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Socio", "Tipo", "Servicio", "Monto", "Fecha", "Estado"].map((h) => (
                      <th key={h} className="px-2 py-2 text-left font-semibold uppercase" style={{ color: "var(--accent-green)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.slice(0, 10).map((r, i) => {
                    const color = r.estado === "valido" ? "var(--accent-green)" : r.estado === "advertencia" ? "var(--state-warning)" : "var(--state-error)";
                    const icon = r.estado === "valido" ? "✓" : r.estado === "advertencia" ? "⚠" : "✕";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-2 py-2 text-white max-w-[120px] truncate">{r.socio_nombre}</td>
                        <td className="px-2 py-2 text-white">{r.tipo_socio}</td>
                        <td className="px-2 py-2">
                          <span className="text-white">{r.servicio_nombre}</span>
                          {r.service_id ? (
                            <span className="ml-1 text-[10px] rounded px-1 py-0.5" style={{ background: "var(--accent-green-soft)", color: "var(--accent-green)" }}>✓ vinculado</span>
                          ) : (
                            <span className="ml-1 text-[10px] rounded px-1 py-0.5" style={{ background: "rgba(255,184,0,0.15)", color: "var(--state-warning)" }}>Sin vincular</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-white tabular-nums">{r.monto_cobrado > 0 ? `$${r.monto_cobrado.toFixed(2)}` : "$0"}</td>
                        <td className="px-2 py-2 text-white">{r.fecha_uso}</td>
                        <td className="px-2 py-2" style={{ color }} title={r.mensaje}>{icon}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {registros.length > 10 && (
                <p className="text-xs text-center py-2" style={{ color: "var(--text-muted)" }}>
                  Mostrando 10 de {registros.length} registros
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              {advertencias > 0 && (
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={incluirAdvertencias} onChange={(e) => setIncluirAdvertencias(e.target.checked)} />
                  Incluir {advertencias} filas con advertencias
                </label>
              )}
              <div className="flex gap-2">
                <button onClick={handleImport} disabled={importando || validos === 0} className="btn-primary flex-1">
                  {importando ? "Importando..." : `Importar ${validos + (incluirAdvertencias ? advertencias : 0)} registros válidos`}
                </button>
                <button onClick={() => { setStep("upload"); setRegistros([]); }} className="btn-ghost">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Done */}
        {step === "done" && (
          <div className="card text-center py-8">
            <div className="mb-3" style={{ color: "var(--accent-green)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p className="text-lg font-bold text-white mb-1">¡Importación completada!</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Los datos ya están disponibles en Estadísticas.
            </p>
            <button onClick={() => { setStep("upload"); setRegistros([]); }} className="btn-secondary mt-4 text-sm">
              Importar otro archivo
            </button>
          </div>
        )}

        {/* Historial de imports */}
        <section>
          <h2 className="section-label mb-3 mt-2">IMPORTACIONES ANTERIORES</h2>
          {importsAnteriores.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin importaciones anteriores</p>
          ) : (
            <div className="space-y-2">
              {importsAnteriores.slice(0, 10).map((imp) => (
                <div key={imp.id} className="card py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{imp.archivo_nombre}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(imp.fecha_import).toLocaleDateString("es-AR")} — {imp.registros_validos} registros
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{
                          background: imp.estado === "completo" ? "var(--accent-green-soft)" : "rgba(255,184,0,0.15)",
                          color: imp.estado === "completo" ? "var(--accent-green)" : "var(--state-warning)",
                        }}
                      >
                        {imp.estado}
                      </span>
                      <button onClick={() => verDetalle(imp.id)} className="text-xs hover:underline" style={{ color: "var(--text-muted)" }}>
                        {detalleImport === imp.id ? "Ocultar" : "Ver detalle"}
                      </button>
                      {detalleImport === imp.id && (
                        <button onClick={() => eliminarImport(imp.id)} className="text-xs hover:underline" style={{ color: "var(--state-error)" }}>
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
