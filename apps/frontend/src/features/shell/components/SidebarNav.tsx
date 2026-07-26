import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight, Shield } from "lucide-react";
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
  // Agrupación puramente visual (ver AppShell.tsx): ítems con el mismo
  // valor de `grupo` se anidan bajo un mismo encabezado plegable, sin
  // afectar rutas, permisos ni RBAC.
  grupo?: string;
}

interface SidebarNavProps {
  /** Lista ya filtrada por permisos/tipoRol/organización (ver AppShell). */
  navItems: SidebarNavItem[];
  perfil?: PerfilActual;
  /** Se invoca al hacer click en un ítem (usado por el drawer móvil para cerrarse). */
  onNavigate?: () => void;
}

type EntradaNav =
  | { tipo: "item"; item: SidebarNavItem }
  | { tipo: "grupo"; nombre: string; items: SidebarNavItem[] };

// Agrupa los ítems consecutivos que comparten `grupo` en una sola entrada,
// preservando el orden original de NAV_ITEMS. Un ítem sin `grupo` se
// muestra igual que antes (link de primer nivel).
function agruparNavItems(items: SidebarNavItem[]): EntradaNav[] {
  const entradas: EntradaNav[] = [];
  const indicePorGrupo = new Map<string, number>();

  for (const item of items) {
    if (!item.grupo) {
      entradas.push({ tipo: "item", item });
      continue;
    }
    const indiceExistente = indicePorGrupo.get(item.grupo);
    if (indiceExistente !== undefined) {
      const entradaExistente = entradas[indiceExistente];
      if (entradaExistente.tipo === "grupo") {
        entradaExistente.items.push(item);
      }
      continue;
    }
    indicePorGrupo.set(item.grupo, entradas.length);
    entradas.push({ tipo: "grupo", nombre: item.grupo, items: [item] });
  }

  return entradas;
}

const clasesLinkNav = (isActive: boolean) =>
  `block rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? "bg-primary text-on-primary" : "text-muted hover:bg-surface"
  }`;

/**
 * Única fuente de la navegación: la usan tanto el sidebar de escritorio
 * como el drawer móvil en AppShell, para no duplicar el listado ni el
 * marcado de ítems activos entre ambos layouts.
 */
export function SidebarNav({ navItems, perfil, onNavigate }: SidebarNavProps) {
  const entradas = agruparNavItems(navItems);

  // Grupos plegados por nombre; por defecto todos los grupos aparecen
  // expandidos (mejor descubribilidad de los ítems anidados).
  const [gruposColapsados, setGruposColapsados] = useState<Set<string>>(new Set());

  function alternarGrupo(nombre: string) {
    setGruposColapsados((anterior) => {
      const siguiente = new Set(anterior);
      if (siguiente.has(nombre)) {
        siguiente.delete(nombre);
      } else {
        siguiente.add(nombre);
      }
      return siguiente;
    });
  }

  return (
    <>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">Navegación</p>
      <nav className="mt-4 space-y-1">
        {entradas.map((entrada) => {
          if (entrada.tipo === "item") {
            return (
              <NavLink
                key={entrada.item.to}
                to={entrada.item.to}
                onClick={onNavigate}
                className={({ isActive }) => clasesLinkNav(isActive)}
              >
                {entrada.item.label}
              </NavLink>
            );
          }

          const expandido = !gruposColapsados.has(entrada.nombre);
          const idSubmenu = `grupo-nav-${entrada.nombre.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            <div key={entrada.nombre}>
              <button
                type="button"
                onClick={() => alternarGrupo(entrada.nombre)}
                aria-expanded={expandido}
                aria-controls={idSubmenu}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  {entrada.nombre}
                </span>
                {expandido ? (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              {expandido && (
                <div id={idSubmenu} className="ml-3 mt-1 space-y-1 border-l border-border pl-3">
                  {entrada.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) => clasesLinkNav(isActive)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
