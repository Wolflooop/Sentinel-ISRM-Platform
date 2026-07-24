import { AccionAuditoria, ActividadRecienteGlobal } from "../types/dashboard.types";

interface RecentActivityListProps {
  actividad: ActividadRecienteGlobal[];
}

const ETIQUETA_ACCION: Record<AccionAuditoria, string> = {
  CREAR: "Creó",
  EDITAR: "Editó",
  ELIMINAR: "Eliminó",
  APROBAR: "Aprobó",
};

const ESTILO_ACCION: Record<AccionAuditoria, string> = {
  CREAR: "bg-green-100 text-green-800",
  EDITAR: "bg-sky-100 text-sky-800",
  ELIMINAR: "bg-red-100 text-red-700",
  APROBAR: "bg-teal-100 text-teal-800",
};

export function RecentActivityList({ actividad }: RecentActivityListProps) {
  if (actividad.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-border bg-surface-elevated p-5">
        <p className="text-sm text-muted">Aún no hay actividad registrada en la plataforma.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5 shadow-sm">
      <h2 className="text-sm font-medium text-ink">Actividad reciente del sistema</h2>
      <ul className="mt-4 space-y-3">
        {actividad.map((registro) => (
          <li key={registro.id} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate text-ink">
                <span className="font-medium">{registro.usuario.nombre}</span>{" "}
                <span
                  className={`mx-1 rounded-full px-2 py-0.5 text-xs font-medium ${ESTILO_ACCION[registro.accion]}`}
                >
                  {ETIQUETA_ACCION[registro.accion]}
                </span>
                {registro.entidad.toLowerCase()}
              </p>
              <p className="truncate text-xs text-muted">{registro.organizacion.nombre}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-xs text-muted">
              {new Date(registro.fecha).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
