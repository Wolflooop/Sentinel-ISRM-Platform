import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLogout } from "../../auth/hooks/useAuth";
import { tokenStorage } from "../../../lib/tokenStorage";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/contexto", label: "Contexto" },
  { to: "/activos", label: "Activos" },
  { to: "/amenazas", label: "Amenazas" },
  { to: "/vulnerabilidades", label: "Vulnerabilidades" },
  { to: "/riesgos", label: "Riesgos" },
  { to: "/riesgos/matriz", label: "Matriz de riesgos" },
  { to: "/controles", label: "Controles" },
  { to: "/reportes", label: "Reportes" },
  { to: "/usuarios", label: "Usuarios" },
  { to: "/roles", label: "Roles" },
  { to: "/organizacion", label: "Organización" },
];

export function AppShell() {
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(tokenStorage.get());

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <Link to="/dashboard" className="text-lg font-semibold text-slate-900">
              Sentinel ISRM
            </Link>
            <p className="text-sm text-slate-500">Gestión de riesgos y controles</p>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Navegación</p>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
