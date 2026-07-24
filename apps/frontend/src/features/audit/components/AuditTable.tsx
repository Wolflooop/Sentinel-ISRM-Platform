import { AuditRecord } from "../types/audit.types";

interface Props {
  registros: AuditRecord[];
}

const ESTILO_ACCION: Record<string, string> = {
  CREAR: "bg-green-100 text-green-800",
  EDITAR: "bg-blue-100 text-blue-800",
  ELIMINAR: "bg-red-100 text-red-700",
  APROBAR: "bg-violet-100 text-violet-800",
};

export function AuditTable({ registros }: Props) {
  if (registros.length === 0) {
    return <p className="mt-4 text-sm text-muted">No existen registros de auditoría</p>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-left text-muted">
          <th className="py-2 pr-4">Fecha</th>
          <th className="py-2 pr-4">Usuario</th>
          <th className="py-2 pr-4">Acción</th>
          <th className="py-2 pr-4">Entidad</th>
          <th className="py-2 pr-4">Registro</th>
          <th className="py-2 pr-4">IP</th>
        </tr>
      </thead>
      <tbody>
        {registros.map((registro) => (
          <tr key={registro.id} className="border-b border-border">
            <td className="py-2 pr-4 text-muted">
              {new Date(registro.fecha).toLocaleString("es-CO")}
            </td>
            <td className="py-2 pr-4 font-medium text-ink">{registro.usuario.nombre}</td>
            <td className="py-2 pr-4">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ESTILO_ACCION[registro.accion] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {registro.accion}
              </span>
            </td>
            <td className="py-2 pr-4 text-muted">{registro.entidad}</td>
            <td className="py-2 pr-4 text-muted">{registro.entidadId}</td>
            <td className="py-2 pr-4 text-muted">{registro.direccionIp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
