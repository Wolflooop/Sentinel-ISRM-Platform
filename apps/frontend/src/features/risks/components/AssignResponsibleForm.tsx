import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { asignarResponsableFormSchema, AsignarResponsableFormValues } from "../schemas/risksSchema";
import { useUsuarios } from "../../users/hooks/useUsers";
import { useAsignarResponsable } from "../hooks/useRisks";

interface Props {
  riesgoId: string;
  responsableActualId: string;
  onDone?: () => void;
}

// V2 (punto 13 del prompt): único componente que puede cambiar el
// responsable de un riesgo; nunca se edita desde un formulario genérico.
export function AssignResponsibleForm({ riesgoId, responsableActualId, onDone }: Props) {
  const { data: usuarios } = useUsuarios();
  const asignar = useAsignarResponsable(riesgoId);

  const { register, handleSubmit } = useForm<AsignarResponsableFormValues>({
    resolver: zodResolver(asignarResponsableFormSchema),
    defaultValues: { responsableId: responsableActualId },
  });

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={handleSubmit((values) => asignar.mutate(values, { onSuccess: onDone }))}
    >
      <div>
        <label className="block text-xs font-medium text-muted">Reasignar responsable</label>
        <select
          className="mt-1 rounded-md border border-border bg-surface-elevated px-3 py-1.5 text-sm text-ink"
          {...register("responsableId")}
        >
          {usuarios?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={asignar.isPending}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {asignar.isPending ? "Guardando..." : "Reasignar"}
      </button>
    </form>
  );
}
