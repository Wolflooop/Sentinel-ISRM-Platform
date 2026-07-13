import { FiltrosActivos } from "../types/assets.types";
import { useCategoriasActivo } from "../hooks/useAssets";

interface Props {
  filtros: FiltrosActivos;
  onChange: (filtros: FiltrosActivos) => void;
}

export function AssetsFilterBar({ filtros, onChange }: Props) {
  const { data: categorias } = useCategoriasActivo();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-500">Buscar</label>
        <input
          type="text"
          placeholder="Nombre del activo..."
          value={filtros.busqueda ?? ""}
          onChange={(e) => onChange({ ...filtros, busqueda: e.target.value || undefined })}
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Tipo</label>
        <select
          value={filtros.categoriaId ?? ""}
          onChange={(e) => onChange({ ...filtros, categoriaId: e.target.value || undefined })}
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Criticidad</label>
        <select
          value={filtros.criticidad ?? ""}
          onChange={(e) =>
            onChange({
              ...filtros,
              criticidad: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500">Estado</label>
        <select
          value={filtros.estado ?? ""}
          onChange={(e) =>
            onChange({ ...filtros, estado: (e.target.value || undefined) as FiltrosActivos["estado"] })
          }
          className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="RETIRADO">Retirado</option>
        </select>
      </div>
    </div>
  );
}
