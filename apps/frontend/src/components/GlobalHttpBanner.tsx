import { useEffect, useState } from "react";
import { HttpNotification, subscribeHttpNotifications } from "../lib/httpNotifications";

const DURACION_MS = 6000;

/**
 * Banner global para errores HTTP transversales (403 y 500).
 *
 * Se monta una sola vez en App.tsx, fuera de cualquier módulo funcional.
 * No decide nada de negocio: solo refleja lo que el interceptor de Axios
 * publica en lib/httpNotifications.ts. Los errores de negocio (400, 404,
 * 409, etc.) nunca llegan aquí — siguen manejándose donde ya se manejaban,
 * dentro de cada módulo.
 */
export function GlobalHttpBanner() {
  const [notification, setNotification] = useState<HttpNotification | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeHttpNotifications((n) => {
      setNotification(n);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), DURACION_MS);
    return () => window.clearTimeout(timer);
  }, [notification]);

  if (!notification) {
    return null;
  }

  const estilos =
    notification.type === "acceso-denegado"
      ? "bg-amber-50 border-amber-300 text-amber-800"
      : "bg-red-50 border-red-300 text-red-800";

  return (
    <div
      role="alert"
      className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b px-4 py-3 text-sm font-medium shadow-sm ${estilos}`}
    >
      <span>{notification.message}</span>
      <button
        type="button"
        onClick={() => setNotification(null)}
        className="ml-4 rounded px-2 py-1 text-xs font-semibold opacity-70 hover:opacity-100"
        aria-label="Cerrar aviso"
      >
        Cerrar
      </button>
    </div>
  );
}
