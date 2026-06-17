// [REFACTOR v0.2.0]: Empty state component — design system Integra Mutual
import { ReactNode } from "react";

interface EmptyStateProps {
  icono: ReactNode;
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

export default function EmptyState({
  icono,
  titulo,
  subtitulo,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="mb-4 text-[40px] opacity-30">{icono}</div>
      <p className="text-base font-semibold text-white/80">{titulo}</p>
      {subtitulo && (
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.40)]">
          {subtitulo}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
