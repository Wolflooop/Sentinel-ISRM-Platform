
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
