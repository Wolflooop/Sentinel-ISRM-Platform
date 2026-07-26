import { useEffect, useState } from "react";
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
    defaultValues: { estado: "PROPUESTO", porcentajeAvance: 0, controlAsociadoId: "" },
  });

  useEffect(() => {
    if (tratamiento) {
      reset({
        // El control asociado es el que esté marcado como principal; si por
        // datos históricos hubiera más de uno guardado, se toma el primero.
        controlAsociadoId:
          tratamiento.controles.find((c) => c.esPrincipal)?.id ?? tratamiento.controles[0]?.id ?? "",
        estrategia: tratamiento.estrategia,
        descripcionPlan: tratamiento.descripcionPlan,
        usuarioResponsableId: tratamiento.usuarioResponsableId,
        fechaInicio: tratamiento.fechaInicio?.slice(0, 10) ?? "",
        justificacion: tratamiento.justificacion ?? "",
        aprobadoPorId: tratamiento.aprobadoPorId ?? "",
        fechaLimite: tratamiento.fechaLimite.slice(0, 10),
        estado: tratamiento.estado,
        porcentajeAvance: tratamiento.porcentajeAvance,
      });
    }
  }, [tratamiento, reset]);

  const estrategiaSeleccionada = watch("estrategia");
  const estadoSeleccionado = watch("estado");
  const requiereControl = estrategiaSeleccionada === "MITIGAR";
  // Texto de ayuda UX según la obligatoriedad del control asociado por
  // estrategia: Mitigar = obligatorio; Evitar/Transferir = opcional;
  // Aceptar = no obligatorio.
  const textoAyudaControl =
    estrategiaSeleccionada === "MITIGAR"
      ? null
      : estrategiaSeleccionada === "ACEPTAR"
      ? "No es obligatorio para la estrategia Aceptar."
      : estrategiaSeleccionada === "EVITAR" || estrategiaSeleccionada === "TRANSFERIR"
      ? "Opcional para esta estrategia."
      : null;
  // El comentario es obligatorio siempre que haya una transición real de
  // estado del riesgo: en creación SIEMPRE la hay; en edición, solo si el
  // estado seleccionado difiere del que tenía el tratamiento al cargar el
  // formulario.
  const cambiaEstado = !tratamiento || estadoSeleccionado !== tratamiento.estado;
  const [errorComentario, setErrorComentario] = useState<string | null>(null);

  const manejarEnvio = handleSubmit((valores) => {
    if (cambiaEstado && !valores.comentario?.trim()) {
      setErrorComentario("No puede cambiar el estado sin ingresar un comentario.");
      return;
    }
    setErrorComentario(null);
    onSubmit(valores);
  });

  return (
    <form className="space-y-4" onSubmit={manejarEnvio} noValidate>
      <div>
        <label htmlFor="estrategia" className="block text-sm font-medium text-ink">
          Estrategia
        </label>
        <select
          id="estrategia"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
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
        <label htmlFor="controlAsociadoId" className="block text-sm font-medium text-ink">
          Control asociado {requiereControl && <span className="text-red-600">*</span>}
        </label>
        <select
          id="controlAsociadoId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("controlAsociadoId")}
        >
          <option value="">Seleccionar control...</option>
          {controles.map((control) => (
            <option key={control.id} value={control.id}>
              {control.nombre}
            </option>
          ))}
        </select>
        {errors.controlAsociadoId && (
          <p className="mt-1 text-sm text-red-600">{errors.controlAsociadoId.message}</p>
        )}
        {textoAyudaControl && <p className="mt-1 text-xs text-muted">{textoAyudaControl}</p>}
      </div>

      <div>
        <label htmlFor="descripcionPlan" className="block text-sm font-medium text-ink">
          Descripción del plan
        </label>
        <textarea
          id="descripcionPlan"
          rows={3}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("descripcionPlan")}
        />
        {errors.descripcionPlan && (
          <p className="mt-1 text-sm text-red-600">{errors.descripcionPlan.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="justificacion" className="block text-sm font-medium text-ink">
          Justificación
        </label>
        <textarea
          id="justificacion"
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("justificacion")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="usuarioResponsableId" className="block text-sm font-medium text-ink">
            Responsable
          </label>
          <select
            id="usuarioResponsableId"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
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
          <label htmlFor="aprobadoPorId" className="block text-sm font-medium text-ink">
            Aprobado por
          </label>
          <select
            id="aprobadoPorId"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("aprobadoPorId")}
          >
            <option value="">Sin aprobar aún</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-ink">
            Fecha de inicio
          </label>
          <input
            id="fechaInicio"
            type="date"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("fechaInicio")}
          />
        </div>

        <div>
          <label htmlFor="fechaLimite" className="block text-sm font-medium text-ink">
            Fecha límite
          </label>
          <input
            id="fechaLimite"
            type="date"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("fechaLimite")}
          />
          {errors.fechaLimite && <p className="mt-1 text-sm text-red-600">{errors.fechaLimite.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-ink">
            Estado
          </label>
          <select
            id="estado"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("estado")}
          >
            <option value="PROPUESTO">Propuesto</option>
            <option value="EN_EJECUCION">En ejecución</option>
            <option value="COMPLETADO">Completado</option>
            <option value="VENCIDO">Vencido</option>
          </select>
        </div>

        <div>
          <label htmlFor="porcentajeAvance" className="block text-sm font-medium text-ink">
            % de avance
          </label>
          <input
            id="porcentajeAvance"
            type="number"
            min={0}
            max={100}
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            {...register("porcentajeAvance")}
          />
          {errors.porcentajeAvance && (
            <p className="mt-1 text-sm text-red-600">{errors.porcentajeAvance.message}</p>
          )}
        </div>
      </div>

      {estadoSeleccionado === "COMPLETADO" && (
        <p className="text-xs text-muted">
          Al guardar con estado "Completado" se calculará automáticamente el riesgo residual y se
          generará una nueva evaluación RESIDUAL.
        </p>
      )}

      {cambiaEstado && (
        <div>
          <label htmlFor="comentario" className="block text-sm font-medium text-ink">
            Comentario (obligatorio al cambiar de estado)
          </label>
          <textarea
            id="comentario"
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
            placeholder="Ej: Se inició aplicación del plan de mitigación."
            {...register("comentario")}
          />
        </div>
      )}

      {errorComentario && <p className="text-sm text-red-600">{errorComentario}</p>}
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar tratamiento"}
      </button>
    </form>
  );
}
