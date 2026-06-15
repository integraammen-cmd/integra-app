"use client";

import CostMatrixForm from "../../components/CostMatrixForm";
import { useRouter } from "next/navigation";

export default function CargarServicioPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl px-4 py-8 pb-24 bg-[#0f1117] min-h-screen">
      <button
        onClick={() => router.push("/matriz")}
        className="mb-4 text-sm text-blue-400 hover:underline"
      >
        ← Volver a la matriz
      </button>
      <CostMatrixForm onSaved={() => {}} />
    </div>
  );
}
