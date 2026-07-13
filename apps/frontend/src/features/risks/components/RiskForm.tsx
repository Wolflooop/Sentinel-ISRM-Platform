import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearRiesgoFormSchema, CrearRiesgoFormValues } from "../schemas/risksSchema";
import { useActivos } from "../../assets/hooks/useAssets";
import { useAmenazas } from "../../threats/hooks/useThreats";
import { useVulnerabilidades } from "../../vulnerabilities/hooks/useVulnerabilities";

interface Props {
  onSubmit: (values: CrearRiesgoFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

const NIVELES = [1, 2, 3, 4, 5];

export function RiskForm({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: activos } = useActivos({});
  const { data: amenazas } = useAmenazas({});
  const { data: vulnerabilidades } = useVulnerabilidades({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearRiesgoFormValues>({
    resolver: zodResolver(crearRiesgoFormSchema),
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        {errors.amenazaId && (
          <p className="mt-1 text-sm text-red-600">{errors.amenazaId.message}</p>
        )}
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
            <p className="mt-1 text-sm text-red-600">{errors.probabilidad.message}</p>
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
          {errors.impacto && <p className="mt-1 text-sm text-red-600">{errors.impacto.message}</p>}
        </div>
      </div>

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
