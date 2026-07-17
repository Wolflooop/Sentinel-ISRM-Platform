import { EstadoOrganizacion, Organizacion } from "../types/organizations.types";

interface Props {
  organizacion: Organizacion;
  onCambiarEstado: (estado: EstadoOrganizacion) => void;
  isSubmittingRequest: boolean;
}

const ETIQUETAS_ESTADO: Record<EstadoOrganizacion, string> = {
  ACTIVA: "Activa",
  SUSPENDIDA: "Suspendida",
  INACTIVA: "Inactiva",
};

const ESTILOS_BADGE: Record<EstadoOrganizacion, string> = {
  ACTIVA: "bg-green-100 text-green-800",
  SUSPENDIDA: "bg-amber-100 text-amber-800",
  INACTIVA: "bg-slate-200 text-slate-700",
};

export function OrganizationStatusPanel({
  organizacion,
  onCambiarEstado,
  isSubmittingRequest,
}: Props) {
  function solicitarCambio(estado: EstadoOrganizacion) {
    if (estado === organizacion.estado) {
      return;
    }

    const advertencia =
      estado === "ACTIVA"
        ? `¿Confirmas reactivar la organización "${organizacion.nombre}"?`
        : `¿Confirmas cambiar el estado a "${ETIQUETAS_ESTADO[estado]}"? Esto revocará todas las sesiones activas de la organización, incluida la tuya.`;

    if (window.confirm(advertencia)) {
      onCambiarEstado(estado);
    }
  }

  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Estado de la organización</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILOS_BADGE[organizacion.estado]}`}
        >
          {ETIQUETAS_ESTADO[organizacion.estado]}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(ETIQUETAS_ESTADO) as EstadoOrganizacion[]).map((estado) => (
          <button
            key={estado}
            type="button"
            disabled={isSubmittingRequest || estado === organizacion.estado}
            onClick={() => solicitarCambio(estado)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ETIQUETAS_ESTADO[estado]}
          </button>
        ))}
      </div>
    </div>
  );
}
