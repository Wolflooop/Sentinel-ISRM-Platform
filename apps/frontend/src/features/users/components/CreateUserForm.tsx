import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearUsuarioFormSchema, CrearUsuarioFormValues } from "../schemas/usersSchema";
import { useRoles } from "../../roles/hooks/useRoles";
import { useOrganizaciones } from "../../organizations/hooks/useOrganization";
import { esSuperAdminActual } from "../../../lib/authSession";

interface Props {
  onSubmit: (values: CrearUsuarioFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function CreateUserForm({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const esSuperAdmin = esSuperAdminActual();

  const { data: roles } = useRoles();
  // Solo se piden las organizaciones cuando el actor es el Administrador
  // Principal: es el único que puede seleccionar la organización de
  // destino. Un ADMIN_TIC nunca ve ni envía este campo — su organización
  // se asigna automáticamente en el backend a partir de su propio token.
  const { data: organizaciones } = useOrganizaciones(esSuperAdmin);

  // Un ADMIN_TIC solo puede crear USUARIO_COMUN; el Administrador Principal
  // puede crear ADMIN_TIC o USUARIO_COMUN (nunca otro SUPER_ADMIN desde
  // este formulario). Esto es una ayuda de UX — el backend vuelve a
  // validar la jerarquía de forma independiente y nunca confía en esto.
  const rolesDisponibles = roles?.filter((rol) =>
    esSuperAdmin ? rol.tipo !== "SUPER_ADMIN" : rol.tipo === "USUARIO_COMUN"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrearUsuarioFormValues>({
    resolver: zodResolver(crearUsuarioFormSchema),
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-ink">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
          {...register("nombre")}
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Correo
        </label>
        <input
          id="email"
          type="email"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Contraseña inicial
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="rolId" className="block text-sm font-medium text-ink">
          Rol
        </label>
        <select
          id="rolId"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
          defaultValue=""
          {...register("rolId")}
        >
          <option value="" disabled>
            Selecciona un rol...
          </option>
          {rolesDisponibles?.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>
        {errors.rolId && <p className="mt-1 text-sm text-red-600">{errors.rolId.message}</p>}
      </div>

      {/* Solo el Administrador Principal ve y controla este campo. Un
          ADMIN_TIC nunca lo ve: su organización se asigna automáticamente
          en el backend, nunca desde este formulario. */}
      {esSuperAdmin && (
        <div>
          <label htmlFor="organizacionId" className="block text-sm font-medium text-ink">
            Organización
          </label>
          <select
            id="organizacionId"
            className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink"
            defaultValue=""
            {...register("organizacionId")}
          >
            <option value="" disabled>
              Selecciona una organización...
            </option>
            {organizaciones?.map((organizacion) => (
              <option key={organizacion.id} value={organizacion.id}>
                {organizacion.nombre}
              </option>
            ))}
          </select>
          {errors.organizacionId && (
            <p className="mt-1 text-sm text-red-600">{errors.organizacionId.message}</p>
          )}
        </div>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
