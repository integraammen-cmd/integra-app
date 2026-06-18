// [FEATURE v0.3.0]: Informes con tabs — Matriz | Estadísticas | Comparador
"use client";

import { useState, useEffect } from "react";
import CostMatrixView from "../components/CostMatrixView";
import EstadisticasTab from "../components/EstadisticasTab";
import ComparadorTab from "../components/ComparadorTab";

const TABS = [
  { id: "matriz", label: "Matriz" },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "comparador", label: "Comparador" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function MatrizPage() {
  const [activeTab, setActiveTab] = useState<TabId>("matriz");
  const [grupos, setGrupos] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data: { name: string }[]) => {
        setGrupos(data.map((g) => g.name));
      });
  }, []);

  return (
    <div className="page-container" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      {/* Header con tabs */}
      <header style={{ borderBottom: "1px solid var(--border)", padding: "16px 16px 0 16px", margin: "0 -16px" }}>
        <h1 className="text-[20px] font-bold text-white px-0">Informes</h1>
        <div className="flex gap-0 mt-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-xs font-semibold transition-all border-b-2"
              style={{
                color: activeTab === tab.id ? "var(--accent-green)" : "var(--text-muted)",
                borderColor: activeTab === tab.id ? "var(--accent-green)" : "transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="py-4">
        {activeTab === "matriz" && <CostMatrixView embedded />}
        {activeTab === "estadisticas" && <EstadisticasTab grupos={grupos} />}
        {activeTab === "comparador" && <ComparadorTab />}
      </div>
    </div>
  );
}
