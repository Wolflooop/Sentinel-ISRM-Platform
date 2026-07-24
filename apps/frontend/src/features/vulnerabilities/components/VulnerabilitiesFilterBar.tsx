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
        <label className="block text-xs font-medium text-muted">Buscar</label>
        <input
          type="text"
          placeholder="Nombre de la vulnerabilidad..."
          value={filtros.busqueda ?? ""}
          onChange={(e) => onChange({ ...filtros, busqueda: e.target.value || undefined })}
          className="mt-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted">Categoría</label>
        <select
          value={filtros.categoriaId ?? ""}
          onChange={(e) => onChange({ ...filtros, categoriaId: e.target.value || undefined })}
          className="mt-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
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
        <label className="block text-xs font-medium text-muted">Severidad</label>
        <select
          value={filtros.severidad ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              severidad: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="mt-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink placeholder:text-muted"
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
