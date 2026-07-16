import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { treatmentFormSchema, TreatmentFormValues } from "../schemas/treatmentsSchema";
import { Tratamiento } from "../types/treatments.types";

interface OpcionSelect {
  id: string;
  nombre: string;
}

interface Props {
  tratamiento?: Tratamiento;
  controles: OpcionSelect[];
  usuarios: OpcionSelect[];
  onSubmit: (values: TreatmentFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function TreatmentForm({
  tratamiento,
  controles,
  usuarios,
  onSubmit,
  isSubmittingRequest,
  errorMessage,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: { estado: "PLANIFICADO", porcentajeAvance: 0 },
  });

  useEffect(() => {
    if (tratamiento) {
      reset({
        controlPrincipalId: tratamiento.controlPrincipalId ?? "",
        estrategia: tratamiento.estrategia,
        descripcionPlan: tratamiento.descripcionPlan,
        usuarioResponsableId: tratamiento.usuarioResponsableId,
        fechaLimite: tratamiento.fechaLimite.slice(0, 10),
        estado: tratamiento.estado,
        porcentajeAvance: tratamiento.porcentajeAvance,
      });
    }
  }, [tratamiento, reset]);

  const estrategiaSeleccionada = watch("estrategia");
  const estadoSeleccionado = watch("estado");
  const requiereControl = estrategiaSeleccionada === "MITIGAR";

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="estrategia" className="block text-sm font-medium text-slate-700">
          Estrategia
        </label>
        <select
          id="estrategia"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("estrategia")}
        >
          <option value="" disabled>
            Selecciona una estrategia...
          </option>
          <option value="EVITAR">Evitar</option>
          <option value="MITIGAR">Mitigar</option>
          <option value="TRANSFERIR">Transferir</option>
          <option value="ACEPTAR">Aceptar</option>
        </select>
        {errors.estrategia && <p className="mt-1 text-sm text-red-600">{errors.estrategia.message}</p>}
      </div>

      <div>
        <label htmlFor="controlPrincipalId" className="block text-sm font-medium text-slate-700">
          Control principal {requiereControl && <span className="text-red-600">*</span>}
        </label>
        <select
          id="controlPrincipalId"
          defaultValue=""
          disabled={!requiereControl}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          {...register("controlPrincipalId")}
        >
          <option value="">Sin control</option>
          {controles.map((control) => (
            <option key={control.id} value={control.id}>
              {control.nombre}
            </option>
          ))}
        </select>
        {errors.controlPrincipalId && (
          <p className="mt-1 text-sm text-red-600">{errors.controlPrincipalId.message}</p>
        )}
        {!requiereControl && (
          <p className="mt-1 text-xs text-slate-400">Solo aplica cuando la estrategia es "Mitigar".</p>
        )}
      </div>

      <div>
        <label htmlFor="descripcionPlan" className="block text-sm font-medium text-slate-700">
          Descripción del plan
        </label>
        <textarea
          id="descripcionPlan"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("descripcionPlan")}
        />
        {errors.descripcionPlan && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcionPlan.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="usuarioResponsableId" className="block text-sm font-medium text-slate-700">
            Responsable
          </label>
          <select
            id="usuarioResponsableId"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("usuarioResponsableId")}
          >
            <option value="" disabled>
              Selecciona un responsable...
            </option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
          {errors.usuarioResponsableId && (
            <p className="mt-1 text-sm text-red-600">{errors.usuarioResponsableId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="fechaLimite" className="block text-sm font-medium text-slate-700">
            Fecha límite
          </label>
          <input
            id="fechaLimite"
            type="date"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("fechaLimite")}
          />
          {errors.fechaLimite && <p className="mt-1 text-sm text-red-600">{errors.fechaLimite.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-slate-700">
            Estado
          </label>
          <select
            id="estado"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("estado")}
          >
            <option value="PLANIFICADO">Planificado</option>
            <option value="EN_PROGRESO">En progreso</option>
            <option value="IMPLEMENTADO">Implementado</option>
            <option value="VENCIDO">Vencido</option>
          </select>
        </div>

        <div>
          <label htmlFor="porcentajeAvance" className="block text-sm font-medium text-slate-700">
            % de avance
          </label>
          <input
            id="porcentajeAvance"
            type="number"
            min={0}
            max={100}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("porcentajeAvance")}
          />
          {errors.porcentajeAvance && (
            <p className="mt-1 text-sm text-red-600">{errors.porcentajeAvance.message}</p>
          )}
        </div>
      </div>

      {estadoSeleccionado === "IMPLEMENTADO" && (
        <p className="text-xs text-slate-400">
          Al guardar con estado "Implementado" se calculará automáticamente el riesgo residual.
        </p>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar tratamiento"}
      </button>
    </form>
  );
}
