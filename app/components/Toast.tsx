// [REFACTOR v0.2.0]: Toast notification component — design system Integra Mutual
"use client";

import { useEffect } from "react";

interface ToastProps {
  mensaje: string;
  tipo: "success" | "error";
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ mensaje, tipo, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border px-5 py-4 text-sm font-medium shadow-lg transition-opacity duration-300 ${
        tipo === "success" ? "toast-success" : "toast-error"
      }`}
      style={{ backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-2">
        <span>{tipo === "success" ? "✓" : "✕"}</span>
        <span>{mensaje}</span>
      </div>
    </div>
  );
}
