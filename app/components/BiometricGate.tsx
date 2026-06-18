"use client";

import useBiometricAuth from "@/app/hooks/useBiometricAuth";

/**
 * Botón de autenticación biométrica.
 * Muestra un ícono de huella digital. Al presionar, activa WebAuthn.
 * Los hijos se renderizan con disabled={!isEditable}.
 */
export default function BiometricGate({
  children,
}: {
  children: (isEditable: boolean) => React.ReactNode;
}) {
  const { isEditable, isSupported, isAuthenticating, error, authenticate, lock } =
    useBiometricAuth();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={isEditable ? lock : authenticate}
          disabled={isAuthenticating}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            isEditable
              ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              : "btn-primary text-sm"
          }`}
          style={isEditable ? undefined : { padding: "8px 16px" }}
        >
          <span className="text-lg">
            {isEditable ? "🔒" : isAuthenticating ? "⏳" : "🖐️"}
          </span>
          {isAuthenticating
            ? "Verificando..."
            : isEditable
            ? "Bloquear edición"
            : isSupported
            ? "Habilitar edición (biométrico)"
            : "Desbloquear (PIN)"}
        </button>
        {isEditable && (
          <span className="text-xs text-emerald-600 font-medium">
            ✓ Edición habilitada
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {children(isEditable)}
    </div>
  );
}
