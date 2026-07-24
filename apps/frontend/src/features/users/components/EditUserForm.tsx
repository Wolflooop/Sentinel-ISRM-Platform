import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editarUsuarioFormSchema, EditarUsuarioFormValues } from "../schemas/usersSchema";
import { Usuario } from "../types/users.types";
import { useRoles } from "../../roles/hooks/useRoles";
import { esSuperAdminActual } from "../../../lib/authSession";

interface Props {
  usuario: Usuario;
  onSubmit: (values: EditarUsuarioFormValues) => void;
  isSubmittingRequest: boolean;
  errorMessage?: string | null;
}

export function EditUserForm({ usuario, onSubmit, isSubmittingRequest, errorMessage }: Props) {
  const esSuperAdmin = esSuperAdminActual();
  const { data: roles } = useRoles();
  // Misma jerarquía que en la creación: un ADMIN_TIC solo puede dejar a un
  // usuario como USUARIO_COMUN (nunca promoverlo a ADMIN_TIC o
  // SUPER_ADMIN). El backend vuelve a validar esto de forma independiente.
  const rolesDisponibles = roles?.filter((rol) =>
    esSuperAdmin ? rol.tipo !== "SUPER_ADMIN" : rol.tipo === "USUARIO_COMUN"
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditarUsuarioFormValues>({
    resolver: zodResolver(editarUsuarioFormSchema),
  });

  useEffect(() => {
    reset({ nombre: usuario.nombre, email: usuario.email, rolId: usuario.rol.id });
  }, [usuario, reset]);

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

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Correo
        </label>
        <input
          id="email"
          type="email"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="rolId" className="block text-sm font-medium text-ink">
          Rol
        </label>
        <select
          id="rolId"
          className="mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-muted"
          {...register("rolId")}
        >
          {rolesDisponibles?.map((rol) => (
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
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-60"
      >
        {isSubmittingRequest ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
