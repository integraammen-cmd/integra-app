// [FEATURE v0.3.0]: Informes con tabs — Matriz | Estadísticas | Comparador
// [FIX v0.2.4]: Tabs rediseñados como pills grandes con scroll horizontal
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
      <header style={{ borderBottom: "1px solid var(--border)", padding: "16px 16px 12px 16px", margin: "0 -16px" }}>
        <h1 className="text-[20px] font-bold text-white px-0">Informes</h1>
        {/* [FIX v0.2.4]: Pills con scroll horizontal */}
        <div
          className="flex gap-2.5 mt-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0"
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                minWidth: 100,
                textAlign: "center",
                background: activeTab === tab.id ? "var(--accent-green)" : "var(--bg-card)",
                color: activeTab === tab.id ? "#0A1A0A" : "var(--text-secondary)",
                border: activeTab === tab.id ? "none" : "1px solid var(--border)",
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
