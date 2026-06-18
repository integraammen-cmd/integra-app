// [FIX v0.2.3]: Estadísticas — pantalla placeholder
"use client";

export default function EstadisticasPage() {
  return (
    <div className="page-container" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border)", padding: "16px 16px 8px 16px", margin: "0 -16px" }}>
        <h1 className="text-[20px] font-bold text-white">Estadísticas</h1>
        <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>Próximamente</p>
      </header>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-[48px] opacity-20">📊</div>
        <p className="text-base font-semibold text-white/80">Módulo en desarrollo</p>
        <p className="mt-1 text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
          Aquí vas a poder ver estadísticas de uso por socio, servicio y período.
        </p>
      </div>
    </div>
  );
}
