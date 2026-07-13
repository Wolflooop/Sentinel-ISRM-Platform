import { FiltrosVulnerabilidades } from "../types/vulnerabilities.types";
import { useCategoriasVulnerabilidad } from "../hooks/useVulnerabilities";

interface Props {
  filtros: FiltrosVulnerabilidades;
  onChange: (filtros: FiltrosVulnerabilidades) => void;
}

const NIVELES_SEVERIDAD = [1, 2, 3, 4, 5];

export function VulnerabilitiesFilterBar({ filtros, onChange }: Props) {
  const { data: categorias } = useCategoriasVulnerabilidad();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Buscar</label>
        <input
          type="text"
          placeholder="Nombre de la vulnerabilidad..."
          value={filtros.busqueda ?? ""}
          onChange={(e) => onChange({ ...filtros, busqueda: e.target.value || undefined })}
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Categoría</label>
        <select
          value={filtros.categoriaId ?? ""}
          onChange={(e) => onChange({ ...filtros, categoriaId: e.target.value || undefined })}
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Severidad</label>
        <select
          value={filtros.severidad ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              severidad: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas</option>
          {NIVELES_SEVERIDAD.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
