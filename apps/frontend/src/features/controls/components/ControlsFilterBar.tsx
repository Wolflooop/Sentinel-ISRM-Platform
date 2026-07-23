import { FiltrosControles, TipoControl, EstadoImplementacionControl } from "../types/controls.types";

interface Props {
  filtros: FiltrosControles;
  onChange: (filtros: FiltrosControles) => void;
}

const tiposControl: Array<TipoControl | ""> = ["", "PREVENTIVO", "DETECTIVO", "CORRECTIVO"];
const estadosControl: Array<EstadoImplementacionControl | ""> = [
  "",
  "NO_INICIADO",
  "EN_PROGRESO",
  "IMPLEMENTADO",
  "VERIFICADO",
];

export function ControlsFilterBar({ filtros, onChange }: Props) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
      <label className="text-sm text-slate-600">
        <span className="mb-1 block font-medium">Tipo</span>
        <select
          value={filtros.tipo ?? ""}
          onChange={(e) => onChange({ ...filtros, tipo: (e.target.value || undefined) as TipoControl | undefined })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {tiposControl.map((tipo) => (
            <option key={tipo || "todos"} value={tipo}>
              {tipo ? tipo : "Todos"}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-slate-600">
        <span className="mb-1 block font-medium">Estado</span>
        <select
          value={filtros.estadoImplementacion ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              estadoImplementacion: (e.target.value || undefined) as EstadoImplementacionControl | undefined,
            })
          }
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {estadosControl.map((estado) => (
            <option key={estado || "todos"} value={estado}>
              {estado ? estado : "Todos"}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
