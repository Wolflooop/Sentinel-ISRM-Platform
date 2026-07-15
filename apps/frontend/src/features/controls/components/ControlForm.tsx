import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { controlFormSchema, ControlFormValues } from "../schemas/controlsSchema";
import { Control } from "../types/controls.types";

interface Props {
  control?: Control;
  onSubmit: (values: ControlFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function ControlForm({ control, onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ControlFormValues>({
    resolver: zodResolver(controlFormSchema),
    defaultValues: { estadoImplementacion: "NO_APLICADO" },
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
      });
    }
  }, [control, reset]);

  const estadoSeleccionado = watch("estadoImplementacion");

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="codigoIso27001" className="block text-sm font-medium text-slate-700">
            Código ISO 27001
          </label>
          <input
            id="codigoIso27001"
            type="text"
            placeholder="p. ej. A.5.1"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("codigoIso27001")}
          />
        </div>

        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-slate-700">
            Tipo
          </label>
          <select
            id="tipo"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          <label htmlFor="estadoImplementacion" className="block text-sm font-medium text-slate-700">
            Estado de implementación
          </label>
          <select
            id="estadoImplementacion"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("estadoImplementacion")}
          >
            <option value="NO_APLICADO">No aplicado</option>
            <option value="PLANIFICADO">Planificado</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="IMPLEMENTADO">Implementado</option>
          </select>
        </div>

        <div>
          <label htmlFor="fechaImplementacion" className="block text-sm font-medium text-slate-700">
            Fecha de implementación
          </label>
          <input
            id="fechaImplementacion"
            type="date"
            disabled={estadoSeleccionado !== "IMPLEMENTADO"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
            {...register("fechaImplementacion")}
          />
          {errors.fechaImplementacion && (
            <p className="mt-1 text-sm text-red-600">{errors.fechaImplementacion.message}</p>
          )}
          {estadoSeleccionado !== "IMPLEMENTADO" && (
            <p className="mt-1 text-xs text-slate-400">Solo aplica cuando el estado es "Implementado".</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="descripcionImplementacion" className="block text-sm font-medium text-slate-700">
          Descripción de la implementación
        </label>
        <textarea
          id="descripcionImplementacion"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("descripcionImplementacion")}
        />
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-slate-700">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("observaciones")}
        />
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar control"}
      </button>
    </form>
  );
}
