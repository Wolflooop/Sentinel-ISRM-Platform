import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  crearRiesgoAavFormSchema,
  crearRiesgoManualFormSchema,
  CrearRiesgoAavFormValues,
  CrearRiesgoManualFormValues,
  CrearRiesgoFormValues,
} from "../schemas/risksSchema";
import { useCategoriasIdentificacion } from "../hooks/useRisks";
import { useActivos } from "../../assets/hooks/useAssets";
import { useAmenazas } from "../../threats/hooks/useThreats";
import { useVulnerabilidades } from "../../vulnerabilities/hooks/useVulnerabilities";
import { useUsuarios } from "../../users/hooks/useUsers";

interface Props {
  onSubmit: (values: CrearRiesgoFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

const NIVELES = [1, 2, 3, 4, 5];

// V2 (punto 1 del prompt): el mismo formulario cubre ambos orígenes de un
// riesgo. El selector de origen decide cuál de los dos sub-formularios (y
// cuál de los dos schemas Zod) se usa para validar el envío.
export function RiskForm({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const [origen, setOrigen] = useState<"AAV" | "MANUAL">("AAV");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Origen del riesgo</label>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => setOrigen("AAV")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              origen === "AAV" ? "bg-slate-800 text-white" : "border border-slate-300 text-slate-700"
            }`}
          >
            Desde Activo + Amenaza + Vulnerabilidad
          </button>
          <button
            type="button"
            onClick={() => setOrigen("MANUAL")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              origen === "MANUAL" ? "bg-slate-800 text-white" : "border border-slate-300 text-slate-700"
            }`}
          >
            Identificación manual
          </button>
        </div>
      </div>

      {origen === "AAV" ? (
        <RiskFormAav onSubmit={onSubmit} isSubmittingRequest={isSubmittingRequest} errorMessage={errorMessage} />
      ) : (
        <RiskFormManual onSubmit={onSubmit} isSubmittingRequest={isSubmittingRequest} errorMessage={errorMessage} />
      )}
    </div>
  );
}

function RiskFormAav({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: activos } = useActivos({});
  const { data: amenazas } = useAmenazas({});
  const { data: vulnerabilidades } = useVulnerabilidades({});
  const { data: usuarios } = useUsuarios();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearRiesgoAavFormValues>({
    resolver: zodResolver(crearRiesgoAavFormSchema),
    defaultValues: { origen: "AAV" },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" value="AAV" {...register("origen")} />

      <div>
        <label htmlFor="activoId" className="block text-sm font-medium text-slate-700">
          Activo
        </label>
        <select
          id="activoId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("activoId")}
        >
          <option value="" disabled>
            Selecciona un activo...
          </option>
          {activos?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        {errors.activoId && <p className="mt-1 text-sm text-red-600">{errors.activoId.message}</p>}
      </div>

      <div>
        <label htmlFor="amenazaId" className="block text-sm font-medium text-slate-700">
          Amenaza
        </label>
        <select
          id="amenazaId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("amenazaId")}
        >
          <option value="" disabled>
            Selecciona una amenaza...
          </option>
          {amenazas?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
        {errors.amenazaId && <p className="mt-1 text-sm text-red-600">{errors.amenazaId.message}</p>}
      </div>

      <div>
        <label htmlFor="vulnerabilidadId" className="block text-sm font-medium text-slate-700">
          Vulnerabilidad
        </label>
        <select
          id="vulnerabilidadId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("vulnerabilidadId")}
        >
          <option value="" disabled>
            Selecciona una vulnerabilidad...
          </option>
          {vulnerabilidades?.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
        {errors.vulnerabilidadId && (
          <p className="mt-1 text-sm text-red-600">{errors.vulnerabilidadId.message}</p>
        )}
      </div>

      <NivelesYResponsable register={register} errors={errors} usuarios={usuarios} />

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Registrar riesgo"}
      </button>
    </form>
  );
}

function RiskFormManual({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: categorias } = useCategoriasIdentificacion();
  const { data: usuarios } = useUsuarios();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearRiesgoManualFormValues>({
    resolver: zodResolver(crearRiesgoManualFormSchema),
    defaultValues: { origen: "MANUAL" },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <input type="hidden" value="MANUAL" {...register("origen")} />

      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-slate-700">
          Título del riesgo
        </label>
        <input
          id="titulo"
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("titulo")}
        />
        {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("descripcion")}
        />
        {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
      </div>

      <div>
        <label htmlFor="justificacionOrigen" className="block text-sm font-medium text-slate-700">
          Justificación de origen
        </label>
        <textarea
          id="justificacionOrigen"
          rows={2}
          placeholder="¿Cómo se identificó este riesgo si no proviene de un AAV?"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("justificacionOrigen")}
        />
        {errors.justificacionOrigen && (
          <p className="mt-1 text-sm text-red-600">{errors.justificacionOrigen.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="categoriaIdentificacionId" className="block text-sm font-medium text-slate-700">
          Categoría de identificación
        </label>
        <select
          id="categoriaIdentificacionId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("categoriaIdentificacionId")}
        >
          <option value="" disabled>
            Selecciona una categoría...
          </option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.categoriaIdentificacionId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoriaIdentificacionId.message}</p>
        )}
      </div>

      <NivelesYResponsable register={register} errors={errors} usuarios={usuarios} />

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Registrar riesgo"}
      </button>
    </form>
  );
}

// Común a ambos sub-formularios: probabilidad, impacto (punto 3/4 del
// prompt: alimentan la Evaluacion INHERENTE creada automáticamente) y
// responsable (punto 13: distinto de creador, que se fija en el backend
// al usuario autenticado).
function NivelesYResponsable({
  register,
  errors,
  usuarios,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  usuarios: Array<{ id: string; nombre: string }> | undefined;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="probabilidad" className="block text-sm font-medium text-slate-700">
            Probabilidad (1–5)
          </label>
          <select
            id="probabilidad"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("probabilidad")}
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.probabilidad && (
            <p className="mt-1 text-sm text-red-600">{errors.probabilidad.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="impacto" className="block text-sm font-medium text-slate-700">
            Impacto (1–5)
          </label>
          <select
            id="impacto"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register("impacto")}
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.impacto && <p className="mt-1 text-sm text-red-600">{errors.impacto.message as string}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="responsableId" className="block text-sm font-medium text-slate-700">
          Responsable
        </label>
        <select
          id="responsableId"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("responsableId")}
        >
          <option value="" disabled>
            Selecciona un responsable...
          </option>
          {usuarios?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
        {errors.responsableId && (
          <p className="mt-1 text-sm text-red-600">{errors.responsableId.message as string}</p>
        )}
      </div>
    </>
  );
}
