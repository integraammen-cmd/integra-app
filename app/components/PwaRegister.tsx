"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] SW registrado, scope:", reg.scope);
      })
      .catch((err) => {
        console.warn("[PWA] SW falló:", err.message);
      });
  }, []);

  return null;
}
