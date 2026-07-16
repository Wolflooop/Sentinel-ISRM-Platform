/**
 * Canal de notificaciones HTTP centralizadas.
 *
 * El interceptor de respuesta de Axios (lib/apiClient.ts) no es un
 * componente de React y no tiene acceso a estado ni contexto — por eso no
 * puede mostrar UI directamente. Este módulo es el punto de desacople: el
 * interceptor publica eventos aquí, y un único componente global
 * (components/GlobalHttpBanner.tsx, montado una vez en App.tsx) los
 * consume y renderiza. Ningún módulo funcional necesita saber que esto
 * existe.
 */
export type HttpNotification =
  | { type: "acceso-denegado"; message: string }
  | { type: "error-servidor"; message: string };

type Listener = (notification: HttpNotification) => void;

const listeners = new Set<Listener>();

export function publishHttpNotification(notification: HttpNotification): void {
  listeners.forEach((listener) => listener(notification));
}

export function subscribeHttpNotifications(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
