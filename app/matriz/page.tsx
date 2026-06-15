import CostMatrixView from "../components/CostMatrixView";

export const dynamic = "force-dynamic";

export default function MatrizPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 bg-[#0f1117] min-h-screen">
      <CostMatrixView />
    </div>
  );
}
