import { FiltrosAmenazas } from "../types/threats.types";
import { useCategoriasAmenaza } from "../hooks/useThreats";

interface Props {
  filtros: FiltrosAmenazas;
  onChange: (filtros: FiltrosAmenazas) => void;
}

export function ThreatsFilterBar({ filtros, onChange }: Props) {
  const { data: categorias } = useCategoriasAmenaza();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Buscar</label>
        <input
          type="text"
          placeholder="Nombre de la amenaza..."
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
        <label className="block text-xs font-medium text-slate-500">Origen</label>
        <select
          value={filtros.origen ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              origen: (e.target.value || undefined) as FiltrosAmenazas["origen"],
            })
          }
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          <option value="INTERNO">Interno</option>
          <option value="EXTERNO">Externo</option>
        </select>
      </div>
    </div>
  );
}
