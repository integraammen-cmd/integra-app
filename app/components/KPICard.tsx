// [REFACTOR v0.2.0]: KPI Card component — design system Integra Mutual
import { ReactNode } from "react";

interface KPICardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: ReactNode;
  borderColor?: string;
  badge?: string;
}

export default function KPICard({
  titulo,
  valor,
  subtitulo,
  icono,
  borderColor,
  badge,
}: KPICardProps) {
  return (
    <div
      className="card relative"
      style={borderColor ? { borderColor } : undefined}
    >
      {/* Badge numérico en esquina superior derecha */}
      {badge && (
        <div className="badge-number absolute top-3 right-3 text-xs">
          {badge}
        </div>
      )}

      {/* Ícono */}
      <div className="mb-3 text-white/70" style={{ fontSize: "22px" }}>
        {icono}
      </div>

      {/* Valor principal */}
      <div className="text-[28px] font-bold text-white leading-tight">
        {valor}
      </div>

      {/* Título */}
      <div className="mt-1 text-sm font-medium text-white/80">
        {titulo}
      </div>

      {/* Subtítulo opcional */}
      {subtitulo && (
        <div className="mt-0.5 text-xs text-[rgba(255,255,255,0.50)]">
          {subtitulo}
        </div>
      )}
    </div>
  );
}
