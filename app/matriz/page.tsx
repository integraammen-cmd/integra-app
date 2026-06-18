// [FIX v0.2.1]: Matriz wrapper — Integra Mutual brand identity
import CostMatrixView from "../components/CostMatrixView";

export const dynamic = "force-dynamic";

export default function MatrizPage() {
  return (
    <div className="page-container" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <CostMatrixView />
    </div>
  );
}
