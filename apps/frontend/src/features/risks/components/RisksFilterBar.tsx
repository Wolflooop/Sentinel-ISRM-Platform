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
] as const;

const NIVELES = ["BAJO", "MEDIO", "ALTO", "CRITICO"] as const;

export function RisksFilterBar({ filtros, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Estado</label>
        <select
          value={filtros.estado ?? ""}
          onChange={(e) =>
            onChange({ ...filtros, estado: (e.target.value || undefined) as FiltrosRiesgos["estado"] })
          }
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
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
        <label className="block text-xs font-medium text-slate-500">Nivel de riesgo</label>
        <select
          value={filtros.nivelRiesgoInherente ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              nivelRiesgoInherente: (e.target.value || undefined) as FiltrosRiesgos["nivelRiesgoInherente"],
            })
          }
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          {NIVELES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
