import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogout } from "../../auth/hooks/useAuth";
import { usePerfilActual } from "../../auth/hooks/usePerfilActual";
import { hasValidSession } from "../../../lib/authSession";
import { tienePermiso } from "../../../lib/permissions";
import { ThemeToggle } from "../../../components/ThemeToggle";

interface NavItem {
  to: string;
  label: string;
  recurso: string | null;
  accion: string;
  // Restringe el ítem a un TipoRol concreto además del permiso por
  // recurso/acción (p. ej. la administración global de organizaciones es
  // exclusiva del Administrador Principal, y "Mi organización" exclusiva
  // del Administrador TIC, aunque otros roles también tengan el permiso
  // "organizaciones:leer").
  soloTipoRol?: "SUPER_ADMIN" | "ADMIN_TIC";
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", recurso: null, accion: "leer" },
  { to: "/usuarios", label: "Usuarios", recurso: "usuarios", accion: "leer" },
  {
    to: "/organizaciones",
    label: "Organizaciones",
    recurso: "organizaciones",
    accion: "leer",
    soloTipoRol: "SUPER_ADMIN",
  },
  {
    to: "/organizacion",
    label: "Mi organización",
    recurso: "organizaciones",
    accion: "leer",
    // "Mi organización" es exclusivo de ADMIN_TIC: un SUPER_ADMIN no
    // pertenece a ninguna organización, y un USUARIO_COMUN no administra
    // la suya (aunque el permiso "organizaciones:leer" ya lo tuviera
    // asignado desde antes — este ítem de navegación no depende de eso).
    soloTipoRol: "ADMIN_TIC",
  },
  { to: "/contexto", label: "Contexto", recurso: "contexto", accion: "leer" },
  { to: "/activos", label: "Activos", recurso: "activos", accion: "leer" },
  { to: "/amenazas", label: "Amenazas", recurso: "amenazas", accion: "leer" },
  {
    to: "/vulnerabilidades",
    label: "Vulnerabilidades",
    recurso: "vulnerabilidades",
    accion: "leer",
  },
  { to: "/riesgos", label: "Riesgos", recurso: "riesgos", accion: "leer" },
  { to: "/riesgos/matriz", label: "Matriz de riesgos", recurso: "riesgos", accion: "leer" },
  { to: "/controles", label: "Controles", recurso: "controles", accion: "leer" },
  { to: "/reportes", label: "Reportes", recurso: "reportes", accion: "leer" },
];

// Etiquetas de presentación del rol para la tarjeta de usuario (ver Fase 9).
// Puramente de UI: no cambian Rol.nombre en la base de datos ni ningún
// permiso — solo cómo se muestra el TipoRol del actor en el sidebar.
const ETIQUETA_TIPO_ROL: Record<string, string> = {
  SUPER_ADMIN: "Administrador Principal",
  ADMIN_TIC: "Administrador TIC",
  USUARIO_COMUN: "Usuario Operativo",
};

export function AppShell() {
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const isAuthenticated = hasValidSession();
  const { data: perfil } = usePerfilActual();

  const handleLogout = () => {
    logoutMutation.mutate();
  };


  const navItems = NAV_ITEMS.filter((item) => {
    if (item.recurso !== null && !tienePermiso(perfil?.permisos, item.recurso, item.accion)) {
      return false;
    }
    if (item.soloTipoRol && item.soloTipoRol !== perfil?.usuario.tipoRol) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-border bg-surface-elevated/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link to="/dashboard" className="text-lg font-semibold text-ink">
              Sentinel ISRM
            </Link>
            <p className="text-sm text-muted">Gestión de riesgos y controles</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 rounded-xl border border-border bg-surface-elevated p-4 shadow-sm lg:block">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">Navegación</p>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
