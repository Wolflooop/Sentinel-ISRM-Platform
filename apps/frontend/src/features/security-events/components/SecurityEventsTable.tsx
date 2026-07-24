import { SecurityEvent } from "../types/security-events.types";

interface Props {
  eventos: SecurityEvent[];
}

const ESTILO_RESULTADO: Record<string, string> = {
  EXITO: "bg-green-100 text-green-800",
  FALLIDO: "bg-red-100 text-red-700",
};

const ESTILO_SEVERIDAD: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-800",
  ADVERTENCIA: "bg-amber-100 text-amber-800",
  ALTA: "bg-orange-100 text-orange-800",
  CRITICA: "bg-red-100 text-red-800",
};

export function SecurityEventsTable({ eventos }: Props) {
  if (eventos.length === 0) {
    return <p className="mt-4 text-sm text-muted">No existen eventos de seguridad</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted">
          <th className="py-2 pr-4">Fecha</th>
          <th className="py-2 pr-4">Evento</th>
          <th className="py-2 pr-4">Resultado</th>
          <th className="py-2 pr-4">Severidad</th>
          <th className="py-2 pr-4">Usuario</th>
          <th className="py-2 pr-4">IP</th>
          <th className="py-2 pr-4">Descripción</th>
        </tr>
      </thead>
      <tbody>
        {eventos.map((evento) => (
          <tr key={evento.id} className="border-b border-border">
            <td className="py-2 pr-4 text-muted">
              {new Date(evento.fecha).toLocaleString("es-CO")}
            </td>
            <td className="py-2 pr-4 font-medium text-ink">{evento.evento}</td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ESTILO_RESULTADO[evento.resultado] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {evento.resultado}
              </span>
            </td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ESTILO_SEVERIDAD[evento.severidad] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {evento.severidad}
              </span>
            </td>
            <td className="py-2 pr-4 text-muted">{evento.usuario?.nombre ?? "—"}</td>
            <td className="py-2 pr-4 text-muted">{evento.direccionIp}</td>
            <td className="py-2 pr-4 text-muted">{evento.descripcion}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
