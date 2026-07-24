import { FiltrosRiesgos } from "../types/risks.types";

interface Props {
  filtros: FiltrosRiesgos;
  onChange: (filtros: FiltrosRiesgos) => void;
}

const ESTADOS = [
  "IDENTIFICADO",
  "EN_ANALISIS",
  "EVALUADO",
  "TRATADO",
  "CERRADO",
  "MONITOREADO",
  "ACEPTADO",
  "REABIERTO",
] as const;

const ORIGENES = ["AAV", "MANUAL"] as const;

export function RisksFilterBar({ filtros, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-muted">Estado</label>
        <select
          value={filtros.estado ?? ""}
          onChange={(e) =>
            onChange({ ...filtros, estado: (e.target.value || undefined) as FiltrosRiesgos["estado"] })
          }
          className="mt-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
        >
          <option value="">Todos</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted">Origen</label>
        <select
          value={filtros.origen ?? ""}
          onChange={(e) =>
            onChange({ ...filtros, origen: (e.target.value || undefined) as FiltrosRiesgos["origen"] })
          }
          className="mt-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
        >
          <option value="">Todos</option>
          {ORIGENES.map((o) => (
            <option key={o} value={o}>
              {o === "AAV" ? "Activo + Amenaza + Vulnerabilidad" : "Manual"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
