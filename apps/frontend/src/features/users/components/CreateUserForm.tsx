import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearUsuarioFormSchema, CrearUsuarioFormValues } from "../schemas/usersSchema";
import { useRoles } from "../../roles/hooks/useRoles";

interface Props {
  onSubmit: (values: CrearUsuarioFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function CreateUserForm({ onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const { data: roles } = useRoles();
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

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Correo
        </label>
        <input
          id="email"
          type="email"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Contraseña inicial
        </label>
        <input
          id="password"
          type="password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="rolId" className="block text-sm font-medium text-slate-700">
          Rol
        </label>
        <select
          id="rolId"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          defaultValue=""
          {...register("rolId")}
        >
          <option value="" disabled>
            Selecciona un rol...
          </option>
          {roles?.map((rol) => (
            <option key={rol.id} value={rol.id}>
              {rol.nombre}
            </option>
          ))}
        </select>
        {errors.rolId && <p className="mt-1 text-sm text-red-600">{errors.rolId.message}</p>}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting || isSubmittingRequest}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmittingRequest ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
