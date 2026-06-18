// [FEATURE v0.3.0]: FileDropzone — zona de arrastre para CSV/PDF
"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  accept: string[];
  isProcessing?: boolean;
  error?: string | null;
}

export default function FileDropzone({ onFile, accept, isProcessing, error }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all"
        style={{
          borderColor: isDragOver
            ? "var(--accent-green)"
            : error
            ? "var(--state-error)"
            : "var(--border)",
          background: isDragOver
            ? "var(--accent-green-soft)"
            : error
            ? "rgba(255,92,92,0.08)"
            : "var(--bg-overlay)",
        }}
      >
        {isProcessing ? (
          <>
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-3" style={{ borderColor: "var(--accent-green)", borderTopColor: "transparent" }} />
            <p className="text-sm font-medium text-white">Procesando archivo...</p>
          </>
        ) : (
          <>
            <div className="mb-3" style={{ color: error ? "var(--state-error)" : "var(--accent-green)" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Arrastrá tu CSV o PDF aquí
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              o tocá para seleccionar
            </p>
            <span
              className="rounded-full px-4 py-1.5 text-xs font-medium"
              style={{
                background: "var(--accent-green-soft)",
                color: "var(--accent-green)",
              }}
            >
              Seleccionar archivo
            </span>
            <p className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
              Formatos: {accept.join(", ").toUpperCase()}
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <p className="text-xs text-center" style={{ color: "var(--state-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
