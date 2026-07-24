import { NavLink } from "react-router-dom";
import type { PerfilActual } from "../../auth/types/auth.types";

// Etiquetas de presentación del rol para la tarjeta de usuario.
// Puramente de UI: no cambian Rol.nombre en la base de datos ni ningún
// permiso — solo cómo se muestra el TipoRol del actor en la navegación.
const ETIQUETA_TIPO_ROL: Record<string, string> = {
  SUPER_ADMIN: "Administrador Principal",
  ADMIN_TIC: "Administrador TIC",
  USUARIO_COMUN: "Usuario Operativo",
};

export interface SidebarNavItem {
  to: string;
  label: string;
}

interface SidebarNavProps {
  /** Lista ya filtrada por permisos/tipoRol/organización (ver AppShell). */
  navItems: SidebarNavItem[];
  perfil?: PerfilActual;
  /** Se invoca al hacer click en un ítem (usado por el drawer móvil para cerrarse). */
  onNavigate?: () => void;
}

/**
 * Única fuente de la navegación: la usan tanto el sidebar de escritorio
 * como el drawer móvil en AppShell, para no duplicar el listado ni el
 * marcado de ítems activos entre ambos layouts.
 */
export function SidebarNav({ navItems, perfil, onNavigate }: SidebarNavProps) {
  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">Navegación</p>
      <nav className="mt-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? "bg-primary text-on-primary" : "text-muted hover:bg-surface"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {perfil && (
        <div className="mt-6 rounded-lg border border-border bg-surface p-3">
          <p className="truncate text-sm font-semibold text-ink">{perfil.usuario.nombre}</p>
          <p className="text-xs text-muted">
            {ETIQUETA_TIPO_ROL[perfil.usuario.tipoRol] ?? perfil.usuario.rol}
          </p>
          {perfil.usuario.tipoRol === "SUPER_ADMIN" ? (
            <p className="mt-1 text-xs text-muted">Administrador global de la plataforma.</p>
          ) : (
            perfil.usuario.organizacion && (
              <p className="mt-1 truncate text-xs text-muted">
                Organización: {perfil.usuario.organizacion.nombre}
              </p>
            )
          )}
        </div>
      )}
    </>
  );
}
