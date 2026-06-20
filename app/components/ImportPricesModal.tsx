// [FIX v0.2.4]: Modal de importación de precios desde CSV
"use client";

import { useState, useEffect } from "react";

type ServiceRef = { id: string; name: string; group_name: string };
type CsvRow = { nombre_servicio: string; precio_integra_90: number };
type PreviewRow = {
  csvName: string;
  csvPrice: number;
  match: ServiceRef | null;
  currentPrice: number | null;
  status: "update" | "same" | "notfound";
  suggestion: string | null;
};

function parsePriceCsv(text: string): CsvRow[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 2) continue;
    const name = parts[0].trim();
    const price = parseFloat(parts[1].trim().replace(/[^0-9.]/g, ""));
    if (name && !isNaN(price)) {
      rows.push({ nombre_servicio: name, precio_integra_90: price });
    }
  }
  return rows;
}

function findMatch(name: string, services: ServiceRef[]): ServiceRef | null {
  const clean = name.trim().toLowerCase();
  // Match exacto
  const exact = services.find((s) => s.name.trim().toLowerCase() === clean);
  if (exact) return exact;
  // Match parcial
  const partial = services.find((s) =>
    s.name.trim().toLowerCase().includes(clean) || clean.includes(s.name.trim().toLowerCase())
  );
  return partial || null;
}

function findSuggestion(name: string, services: ServiceRef[]): string | null {
  const clean = name.trim().toLowerCase();
  // Buscar el nombre más similar (contiene alguna palabra en común)
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  for (const svc of services) {
    const svcLower = svc.name.toLowerCase();
    for (const w of words) {
      if (svcLower.includes(w)) return svc.name;
    }
  }
  return null;
}

export default function ImportPricesModal({
  isOpen,
  onClose,
  onImported,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [step, setStep] = useState<"file" | "preview" | "done">("file");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [services, setServices] = useState<ServiceRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/services")
        .then((r) => r.json())
        .then((data: ServiceRef[]) => setServices(data))
        .catch(() => setError("No se pudieron cargar los servicios"));
    }
  }, [isOpen]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const csvRows = parsePriceCsv(reader.result as string);
        if (csvRows.length === 0) {
          setError("No se encontraron filas válidas. El formato esperado es: nombre_servicio,precio_integra_90");
          setLoading(false);
          return;
        }

        const preview: PreviewRow[] = csvRows.map((row) => {
          const match = findMatch(row.nombre_servicio, services);
          const suggestion = match ? null : findSuggestion(row.nombre_servicio, services);
          let status: PreviewRow["status"] = "notfound";
          if (match) {
            // fetch current price from existing data via services endpoint doesn't include price
            // We'll just mark as update (the API will handle upsert)
            status = "update";
          }
          return {
            csvName: row.nombre_servicio,
            csvPrice: row.precio_integra_90,
            match,
            currentPrice: null,
            status,
            suggestion,
          };
        });

        setPreviewRows(preview);
        setStep("preview");
      } catch {
        setError("Error al procesar el archivo CSV");
      }
      setLoading(false);
    };
    reader.readAsText(file);
  }

  async function handleConfirm() {
    const toUpdate = previewRows
      .filter((r) => r.status === "update" && r.match)
      .map((r) => ({ service_id: r.match!.id, new_price: r.csvPrice }));

    if (toUpdate.length === 0) {
      setError("No hay servicios para actualizar");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/import-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: toUpdate }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      setResultMsg(`${data.updated} precios actualizados correctamente`);
      setStep("done");
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar precios");
    }
    setLoading(false);
  }

  function handleClose() {
    setStep("file");
    setPreviewRows([]);
    setError(null);
    setResultMsg("");
    onClose();
  }

  if (!isOpen) return null;

  const updateCount = previewRows.filter((r) => r.status === "update").length;
  const notFoundCount = previewRows.filter((r) => r.status === "notfound").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={handleClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6"
        style={{ background: "var(--bg-base)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Importar precios desde CSV</h3>
          <button onClick={handleClose} className="text-xl" style={{ color: "var(--text-muted)" }}>
            ✕
          </button>
        </div>

        {/* Step 1: File selection */}
        {step === "file" && (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              El archivo debe tener dos columnas: <strong>nombre_servicio</strong> y <strong>precio_integra_90</strong>
            </p>
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
              style={{ borderColor: "var(--border)" }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent-green)"; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm font-medium text-white">Seleccionar archivo CSV o TXT</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>o arrastralo aquí</p>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFile}
                className="mt-4 text-sm"
                style={{ color: "var(--accent-green)" }}
              />
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Formato esperado:</p>
              <pre className="text-xs" style={{ color: "var(--text-secondary)" }}>
{`nombre_servicio,precio_integra_90
AMMEN / CONVENIO NUTRICION,20500
ATENCION DOMICILIARIA ENFERMERIA,2000`}
              </pre>
            </div>
          </>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <>
            <div className="mb-3 p-3 rounded-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm text-white">
                <span style={{ color: "var(--accent-green)" }}>{updateCount} servicios se actualizarán</span>
                {" | "}
                <span style={{ color: "var(--text-muted)" }}>0 sin cambios</span>
                {" | "}
                <span style={{ color: "#f59e0b" }}>{notFoundCount} no encontrados</span>
              </p>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left py-2 px-2" style={{ color: "var(--text-muted)" }}>Servicio (CSV)</th>
                    <th className="text-right py-2 px-2" style={{ color: "var(--text-muted)" }}>Precio nuevo</th>
                    <th className="text-left py-2 px-2" style={{ color: "var(--text-muted)" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-2 px-2 text-white">
                        {r.csvName}
                        {r.status === "notfound" && r.suggestion && (
                          <div className="text-[10px] mt-0.5" style={{ color: "#f59e0b" }}>
                            ¿{r.suggestion}?
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right" style={{ color: "var(--accent-green)" }}>
                        ${r.csvPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-2">
                        {r.status === "update" && <span style={{ color: "var(--accent-green)" }}>✅ Se actualizará</span>}
                        {r.status === "notfound" && <span style={{ color: "#f59e0b" }}>⚠️ No encontrado</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleConfirm} disabled={updateCount === 0 || loading} className="btn-primary flex-1 text-sm">
                {loading ? "⏳" : "📤"} Actualizar {updateCount} precios
              </button>
              <button onClick={handleClose} className="btn-ghost text-sm">Cancelar</button>
            </div>
          </>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-lg font-bold text-white">{resultMsg}</p>
            <button onClick={handleClose} className="btn-primary mt-4 text-sm">Cerrar</button>
          </div>
        )}

        {/* Loading & Error */}
        {loading && step === "file" && (
          <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Procesando archivo...</p>
        )}
        {error && (
          <p className="text-sm mt-3 p-3 rounded-lg" style={{ color: "var(--state-error)", background: "rgba(239,68,68,0.1)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
