"use client";

import CostMatrixForm from "@/app/components/CostMatrixForm";
import { useRouter } from "next/navigation";

export default function CargarServicioPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <button
        onClick={() => router.push("/matriz")}
        className="mb-4 text-sm text-[#1e3c72] hover:underline"
      >
        ← Volver a la matriz
      </button>
      <CostMatrixForm onSaved={() => {}} />
    </div>
  );
}
