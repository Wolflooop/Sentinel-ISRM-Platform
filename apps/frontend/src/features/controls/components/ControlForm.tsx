import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { controlFormSchema, ControlFormValues } from "../schemas/controlsSchema";
import { Control } from "../types/controls.types";
import { useUsuarios } from "../../users/hooks/useUsers";

interface Props {
  control?: Control;
  onSubmit: (values: ControlFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function ControlForm({ control, onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: usuarios } = useUsuarios();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ControlFormValues>({
    resolver: zodResolver(controlFormSchema),
    defaultValues: { estadoImplementacion: "NO_INICIADO" },
  });

  useEffect(() => {
    if (control) {
      reset({
        codigoIso27001: control.codigoIso27001 ?? "",
        nombre: control.nombre,
        tipo: control.tipo,
        estadoImplementacion: control.estadoImplementacion,
        fechaImplementacion: control.fechaImplementacion?.slice(0, 10) ?? "",
        descripcionImplementacion: control.descripcionImplementacion ?? "",
        observaciones: control.observaciones ?? "",
        responsableId: control.responsable?.id ?? "",
      });
    }
  }, [control, reset]);

  const estadoSeleccionado = watch("estadoImplementacion");

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-ink">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="codigoIso27001" className="block text-sm font-medium text-ink">
            Código ISO 27001
          </label>
          <input
            id="codigoIso27001"
            type="text"
            placeholder="p. ej. A.5.1"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("codigoIso27001")}
          />
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-ink">
            Tipo
          </label>
          <select
            id="tipo"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("tipo")}
          >
            <option value="" disabled>
              Selecciona un tipo...
            </option>
            <option value="PREVENTIVO">Preventivo</option>
            <option value="DETECTIVO">Detectivo</option>
            <option value="CORRECTIVO">Correctivo</option>
          </select>
          {errors.tipo && <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="estadoImplementacion" className="block text-sm font-medium text-ink">
            Estado de implementación
          </label>
          <select
            id="estadoImplementacion"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("estadoImplementacion")}
          >
            <option value="NO_INICIADO">No iniciado</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="IMPLEMENTADO">Implementado</option>
            <option value="VERIFICADO">Verificado</option>
          </select>
        </div>

        <div>
          <label htmlFor="fechaImplementacion" className="block text-sm font-medium text-ink">
            Fecha de implementación
          </label>
          <input
            id="fechaImplementacion"
            type="date"
            disabled={!["IMPLEMENTADO", "VERIFICADO"].includes(estadoSeleccionado)}
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted disabled:bg-surface disabled:text-muted"
            {...register("fechaImplementacion")}
          />
          {errors.fechaImplementacion && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaImplementacion.message}</p>
          )}
          {!["IMPLEMENTADO", "VERIFICADO"].includes(estadoSeleccionado) && (
            <p className="mt-1 text-xs text-muted">Solo aplica cuando el estado es "Implementado" o "Verificado".</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="descripcionImplementacion" className="block text-sm font-medium text-ink">
          Descripción de la implementación
        </label>
        <textarea
          id="descripcionImplementacion"
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("descripcionImplementacion")}
        />
      </div>

      <div>
        <label htmlFor="responsableId" className="block text-sm font-medium text-ink">
          Responsable
        </label>
        <select
          id="responsableId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("responsableId")}
        >
          <option value="">Sin responsable asignado</option>
          {usuarios?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-ink">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("observaciones")}
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar control"}
      </button>
    </form>
  );
}
