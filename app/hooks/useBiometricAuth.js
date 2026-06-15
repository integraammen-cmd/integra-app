"use client";

import { useState, useCallback } from "react";

type BiometricState = {
  isEditable: boolean;
  isSupported: boolean;
  isAuthenticating: boolean;
  error: string | null;
};

/**
 * Hook de seguridad biométrica vía WebAuthn API.
 * Protege la edición de precios y descuentos en Integra.
 *
 * Uso:
 *   const { isEditable, authenticate, lock } = useBiometricAuth();
 *
 * Fallback: si el dispositivo no tiene sensor biométrico, pregunta un PIN simple.
 * El estado isEditable se pierde al cerrar la pestaña (no persiste).
 */
export default function useBiometricAuth() {
  const [state, setState] = useState<BiometricState>({
    isEditable: false,
    isSupported: false,
    isAuthenticating: false,
    error: null,
  });

  // Verificar soporte al montar
  const checkSupport = useCallback(async () => {
    const available =
      typeof window !== "undefined" &&
      !!window.PublicKeyCredential &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
        "function";

    if (!available) {
      setState((s) => ({ ...s, isSupported: false }));
      return false;
    }

    try {
      const supported =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setState((s) => ({ ...s, isSupported: supported }));
      return supported;
    } catch {
      setState((s) => ({ ...s, isSupported: false }));
      return false;
    }
  }, []);

  // Autenticar con biometría
  const authenticate = useCallback(async () => {
    setState((s) => ({ ...s, isAuthenticating: true, error: null }));

    const supported = await checkSupport();

    if (supported) {
      try {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const credential = (await navigator.credentials.get({
          publicKey: {
            challenge,
            rpId: window.location.hostname,
            userVerification: "required",
            timeout: 30000,
          },
        })) as PublicKeyCredential | null;

        if (credential) {
          setState((s) => ({ ...s, isEditable: true, isAuthenticating: false }));
          return true;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error de autenticación";
        setState((s) => ({ ...s, error: message, isAuthenticating: false }));
        return false;
      }
    }

    // Fallback: PIN simple (solo para desarrollo / sin sensor)
    const pin = prompt("Dispositivo sin sensor biométrico. Ingresá el PIN de seguridad:");
    if (pin === "2026") {
      setState((s) => ({ ...s, isEditable: true, isAuthenticating: false }));
      return true;
    }

    setState((s) => ({
      ...s,
      error: "PIN incorrecto o autenticación fallida",
      isAuthenticating: false,
    }));
    return false;
  }, [checkSupport]);

  // Bloquear edición
  const lock = useCallback(() => {
    setState((s) => ({ ...s, isEditable: false, error: null }));
  }, []);

  return {
    ...state,
    checkSupport,
    authenticate,
    lock,
  };
}
