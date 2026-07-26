import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLogout } from "../../auth/hooks/useAuth";
import { usePerfilActual } from "../../auth/hooks/usePerfilActual";
import { hasValidSession } from "../../../lib/authSession";
import { tienePermiso } from "../../../lib/permissions";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { SidebarNav } from "./SidebarNav";

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
  // Módulos que dependen de que el usuario pertenezca a una organización
  // (Contexto, Activos, Amenazas, Vulnerabilidades, Riesgos, Matriz,
  // Controles, Reportes). El SUPER_ADMIN tiene el permiso de recurso
  // igualmente (por diseño del RBAC recibe todo el catálogo), pero no
  // pertenece a ninguna organización, así que estos ítems no le
  // corresponden aunque el permiso técnico lo permita. Se marca como
  // "requiere organización" — no "exclusivo de un tipoRol" — porque la
  // regla real es la dependencia de contexto organizacional, no la
  // jerarquía del rol.
  requiereOrganizacion?: boolean;
  // Agrupación puramente visual del sidebar (ver SidebarNav.tsx): no
  // afecta rutas, permisos, RBAC ni nombres internos — solo cómo se
  // presentan los ítems relacionados bajo un mismo encabezado plegable.
  grupo?: string;
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
  { to: "/contexto", label: "Contexto", recurso: "contexto", accion: "leer", requiereOrganizacion: true },
  { to: "/activos", label: "Activos", recurso: "activos", accion: "leer", requiereOrganizacion: true },
  { to: "/amenazas", label: "Amenazas", recurso: "amenazas", accion: "leer", requiereOrganizacion: true },
  {
    to: "/vulnerabilidades",
    label: "Vulnerabilidades",
    recurso: "vulnerabilidades",
    accion: "leer",
    requiereOrganizacion: true,
  },
  {
    to: "/riesgos",
    label: "Riesgos",
    recurso: "riesgos",
    accion: "leer",
    requiereOrganizacion: true,
    grupo: "Gestión de Riesgos",
  },
  {
    to: "/riesgos/matriz",
    label: "Matriz de riesgos",
    recurso: "riesgos",
    accion: "leer",
    requiereOrganizacion: true,
    grupo: "Gestión de Riesgos",
  },
  { to: "/controles", label: "Controles", recurso: "controles", accion: "leer", requiereOrganizacion: true },
  { to: "/reportes", label: "Reportes", recurso: "reportes", accion: "leer", requiereOrganizacion: true },
  { to: "/auditoria", label: "Auditoría", recurso: "auditoria", accion: "leer", requiereOrganizacion: true },
  {
    to: "/eventos-seguridad",
    label: "Eventos de seguridad",
    recurso: "eventosSeguridad",
    accion: "leer",
    requiereOrganizacion: true,
  },
];

export function AppShell() {
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const isAuthenticated = hasValidSession();
  const { data: perfil } = usePerfilActual();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const esPrimerRender = useRef(true);

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
    if (item.requiereOrganizacion && !perfil?.usuario.organizacion) {
      return false;
    }
    return true;
  });

  // Foco: al abrir el drawer, mover el foco al botón de cierre; al
  // cerrarlo, devolverlo al botón hamburguesa. Se omite en el primer
  // render para no robar el foco al cargar la página.
  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false;
      return;
    }
    if (menuAbierto) {
      closeButtonRef.current?.focus();
    } else {
      hamburgerButtonRef.current?.focus();
    }
  }, [menuAbierto]);

  // Bloquear scroll del body mientras el drawer está abierto, y
  // restaurarlo automáticamente al cerrarse o desmontar.
  useEffect(() => {
    if (!menuAbierto) {
      return;
    }
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowPrevio;
    };
  }, [menuAbierto]);

  // Cerrar con Escape mientras el drawer está abierto.
  useEffect(() => {
    if (!menuAbierto) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuAbierto]);

  // Si la pantalla pasa a escritorio (breakpoint lg de Tailwind, 1024px)
  // mientras el drawer está abierto, cerrarlo para evitar un estado
  // inconsistente (drawer móvil abierto sobre el layout de escritorio).
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuAbierto(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-border bg-surface-elevated/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                ref={hamburgerButtonRef}
                type="button"
                onClick={() => setMenuAbierto(true)}
                className="rounded-md border border-border p-2 text-ink hover:bg-surface lg:hidden"
                aria-label="Abrir menú de navegación"
                aria-expanded={menuAbierto}
                aria-controls="drawer-navegacion-movil"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
            <div>
              <Link to="/dashboard" className="text-lg font-semibold text-ink">
                Sentinel ISRM
              </Link>
              <p className="text-sm text-muted">Gestión de riesgos y controles</p>
            </div>
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
          <SidebarNav navItems={navItems} perfil={perfil} />
        </aside>

        {/* Overlay: clic fuera del panel cierra el drawer. Solo se
            renderiza contenido interactivo cuando el drawer está abierto,
            pero el nodo permanece montado para poder animar la transición
            de opacidad. */}
        <div
          className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 lg:hidden ${
            menuAbierto ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden="true"
          onClick={() => setMenuAbierto(false)}
        />

        {/* Drawer de navegación móvil. */}
        <div
          id="drawer-navegacion-movil"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          aria-hidden={!menuAbierto}
          className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto border-r border-border bg-surface-elevated p-4 shadow-lg transition-transform duration-200 ease-in-out lg:hidden ${
            menuAbierto ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-lg font-semibold text-ink">Sentinel ISRM</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMenuAbierto(false)}
              className="rounded-md border border-border p-2 text-ink hover:bg-surface"
              aria-label="Cerrar menú de navegación"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <SidebarNav navItems={navItems} perfil={perfil} onNavigate={() => setMenuAbierto(false)} />
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
