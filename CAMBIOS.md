# Resumen

Entrega incremental de la Fase 6 (estabilización) del Sentinel ISRM Platform.
Antes de escribir código se auditó físicamente el repositorio subido — sin
asumir que lo descrito en conversaciones anteriores ya existiera — y solo se
implementó lo que la auditoría confirmó como faltante.

## Auditoría inicial (estado real del ZIP recibido, antes de tocar nada)

| Tarea | Estado | Evidencia |
|---|---|---|
| 1. HU-12 (reportes/gráficos PDF) | **EXISTE** | `apps/backend/src/modules/reports/service/reports.service.ts` líneas 151 (`CATEGORIA_ESTADO_CONTROL`), 170–264 (dibujo de gráficos con `doc.rect`), 326 y 361 |
| 2. `GET /auth/me` (permisos dinámicos, backend) | **NO EXISTE** | `apps/backend/src/modules/auth/routes/auth.routes.ts` solo tenía `POST /login` y `POST /logout` |
| 3. Permisos dinámicos (frontend) | **NO EXISTE** | Sin resultados para `usePerfilActual`, `ConPermiso`, `RequierePermiso`, `AccesoRestringidoPage`, `tienePermiso` en todo `apps/frontend/src`. `ProtectedRoute.tsx` tenía un comentario explícito: *"no hay endpoint /me en el backend"*. `AppShell.tsx` usaba una lista fija de navegación sin filtrado por permiso |
| 4. Rediseño de Roles (`RoleCard`) | **NO EXISTE** | `apps/frontend/src/features/roles/components/RolesTable.tsx` presente; `RoleCard.tsx` no existía; `RolesListPage.tsx` importaba `RolesTable` |
| 5. Tematización (`ThemeProvider`) | **NO EXISTE** | Sin resultados para `ThemeProvider`/`ThemeToggle`/`sentinel-theme` en todo el repo. `tailwind.config.js` sin `darkMode` ni tokens de color. `src/index.css` solo con las 3 directivas `@tailwind`. `index.html` sin script de tema |

No se encontró ningún archivo que correspondiera a un ZIP incremental
previo fusionado en este repositorio: las tareas 2–5 se implementaron desde
cero en esta sesión, sobre el código real presente.

## Tarea 1 — HU-12 (ya existente, sin cambios)

No se modificó ningún archivo: la funcionalidad ya estaba implementada y
verificada. No se duplicó ni se tocó.

## Tarea 2 — Permisos dinámicos: `GET /auth/me` (implementada en esta sesión)

Archivos modificados:
- `apps/backend/src/modules/auth/types/auth.types.ts` — tipos `UsuarioPerfil` y `PerfilActualResult`
- `apps/backend/src/modules/auth/repository/auth.repository.ts` — nueva función `findUsuarioPorId` (select mínimo, sin `passwordHash`)
- `apps/backend/src/modules/auth/service/auth.service.ts` — nueva función `obtenerPerfilActual`, reutiliza `findPermisosPorRol` ya existente
- `apps/backend/src/modules/auth/dto/auth.dto.ts` — `PerfilActualResponseDTO`
- `apps/backend/src/modules/auth/mapper/auth.mapper.ts` — `toPerfilActualResponseDTO`
- `apps/backend/src/modules/auth/controller/auth.controller.ts` — `perfilActualController`
- `apps/backend/src/modules/auth/routes/auth.routes.ts` — nueva ruta `GET /me`

Diseño: protegida solo por `authenticate` (no `authorize`), porque es lectura
de lo propio — el mismo criterio documentado en la sesión anterior para este
hallazgo. Reutiliza `findPermisosPorRol`, la misma función que ya usa el
middleware `authorize` para decidir acceso, así que no hay dos fuentes de
verdad para "qué permisos tiene un rol".

## Tarea 3 — Frontend basado en permisos (implementada en esta sesión)

Archivos nuevos:
- `apps/frontend/src/features/auth/hooks/usePerfilActual.ts` — hook de React Query sobre `GET /auth/me`
- `apps/frontend/src/lib/permissions.ts` — helper `tienePermiso(permisos, recurso, accion)`
- `apps/frontend/src/components/ConPermiso.tsx` — oculta acciones sin permiso
- `apps/frontend/src/routes/RequierePermiso.tsx` — guarda de ruta por permiso (segundo nivel, después de `ProtectedRoute`)
- `apps/frontend/src/features/shell/pages/AccesoRestringidoPage.tsx` — página mostrada cuando `RequierePermiso` bloquea el acceso

Archivos modificados:
- `apps/frontend/src/features/auth/types/auth.types.ts` — tipos `PermisoActual`/`PerfilActual`
- `apps/frontend/src/features/auth/services/authService.ts` — `obtenerPerfilActualRequest`
- `apps/frontend/src/features/shell/components/AppShell.tsx` — menú/sidebar dinámico filtrado por permiso real
- `apps/frontend/src/routes/AppRouter.tsx` — cada grupo de rutas de módulo envuelto en `RequierePermiso` (recurso correspondiente, tomado 1:1 de los `authorize(recurso, accion)` ya existentes en cada `*.routes.ts` del backend); **ninguna ruta existente cambió de path ni de componente**
- `apps/frontend/src/features/users/pages/UsersListPage.tsx` — botón "Nuevo usuario" envuelto en `ConPermiso`
- `apps/frontend/src/features/users/components/UsersTable.tsx` — acciones "Editar"/"Activar-Desactivar" envueltas en `ConPermiso`
- `apps/frontend/src/features/roles/pages/RolDetailPage.tsx` — formulario de edición envuelto en `ConPermiso("roles","actualizar")`
- `apps/frontend/src/features/roles/components/RolPermisosPanel.tsx` — botón "Quitar" y sección "Agregar permiso" envueltos en `ConPermiso("roles","gestionarPermisos")`

## Tarea 4 — Rediseño del módulo Roles (implementada en esta sesión)

Archivo nuevo:
- `apps/frontend/src/features/roles/components/RoleCard.tsx` — tarjeta con ícono, badge Sistema/Personalizado, descripción, contador de usuarios (calculado en frontend desde `GET /usuarios`, sin endpoint nuevo) y permisos agrupados por recurso (pide sus propios permisos vía `GET /roles/:id/permisos`, el mismo endpoint que ya usa `RolDetailPage` — no se creó un endpoint de listado nuevo)

Archivo eliminado:
- `apps/frontend/src/features/roles/components/RolesTable.tsx`

Archivo modificado:
- `apps/frontend/src/features/roles/pages/RolesListPage.tsx` — ahora renderiza un grid de `RoleCard` en vez de la tabla

## Tarea 5 — Infraestructura de tematización claro/oscuro (implementada en esta sesión)

Archivos nuevos:
- `apps/frontend/src/lib/theme/ThemeProvider.tsx` — contexto `useTheme`, detecta tema guardado o preferencia del sistema, persiste en `localStorage` bajo la clave `sentinel-theme`
- `apps/frontend/src/components/ThemeToggle.tsx` — botón sol/luna

Archivos modificados:
- `apps/frontend/tailwind.config.js` — `darkMode: "class"` + colores semánticos (`surface`, `surface-elevated`, `ink`, `muted`, `border`, `primary`, `primary-hover`, `on-primary`) respaldados por variables CSS
- `apps/frontend/src/index.css` — variables CSS en `:root` y `.dark` (oscuro = `#14151D`, nunca negro puro; acento de marca `#443E99` en ambos modos)
- `apps/frontend/index.html` — script inline en `<head>` que aplica la clase `dark` antes de montar React (evita parpadeo)
- `apps/frontend/src/App.tsx` — envuelto en `<ThemeProvider>`
- `apps/frontend/src/features/shell/components/AppShell.tsx` — navbar+sidebar migrados a tokens, incluye `ThemeToggle` en el header
- `apps/frontend/src/features/auth/pages/LoginPage.tsx` — migrada a tokens
- `apps/frontend/src/features/dashboard/pages/DashboardPage.tsx` — migrada a tokens
- `apps/frontend/src/features/dashboard/components/IndicatorCard.tsx` — migrado a tokens
- `apps/frontend/src/features/dashboard/components/RiskLevelChart.tsx` — color de leyenda dependiente del tema (Chart.js no hereda CSS)
- `apps/frontend/src/features/dashboard/components/ControlsStatusChart.tsx` — color de barra/ejes/rejilla dependiente del tema
- `apps/frontend/src/features/roles/pages/RolDetailPage.tsx`, `RolPermisosPanel.tsx`, `RolesListPage.tsx`, `RoleCard.tsx` — construidos/migrados a tokens desde el inicio
- `apps/frontend/src/features/users/pages/UsersListPage.tsx`, `CreateUserPage.tsx`, `components/UsersTable.tsx`, `components/CreateUserForm.tsx` — migrados a tokens

**Fuera de alcance, sin tocar (consistente con lo documentado como "Tarea 5 /
pulido visual general — no iniciada"):** `EditUserForm.tsx`, `EditUserPage.tsx`
y el resto de módulos (activos, amenazas, vulnerabilidades, riesgos,
controles, reportes, contexto, organización) — siguen usando clases Tailwind
literales. Funcionan igual que antes; solo no cambian visualmente en modo
oscuro todavía.

## Tarea 6 — Pulido visual general

No se realizó: no estaba iniciada según el estado real del repositorio, y el
encargo de esta sesión fue "implementa únicamente las tareas faltantes"
sobre lo auditado — no se inventó ni se adelantó trabajo no solicitado
explícitamente para esta entrega.

## Limpieza final — archivos eliminados

- `apps/backend/storage/reports/258c94aa-8424-4cfd-af7f-bcd2fe18c0b0_GENERAL_1784189447706.pdf`
- `apps/backend/storage/reports/91e39fc7-8dc4-477a-8e33-2cb7db30d4bd_EJECUTIVO_1784196221377.pdf`
- `apps/backend/storage/reports/91e39fc7-8dc4-477a-8e33-2cb7db30d4bd_GENERAL_1784198720833.pdf`
- `apps/backend/storage/reports/91e39fc7-8dc4-477a-8e33-2cb7db30d4bd_TECNICO_1784196216671.pdf`
  (PDFs generados durante pruebas de HU-12; la carpeta ya tenía su propio
  `.gitignore` declarándola no versionable)
- `apps/backend/dist/` y `apps/frontend/dist/` completas (salida compilada, ya en `.gitignore`, se regenera con `npm run build`)
- `apps/frontend/tsconfig.app.tsbuildinfo` y `apps/frontend/tsconfig.node.tsbuildinfo` (caché incremental de TypeScript, ya en `.gitignore`)

No se encontró ningún `console.log`/`debug`/`info`/`trace` de depuración en
`src` (el único `console.log` del repo está en `prisma/seed.ts`, que es
salida intencional del script, no depuración olvidada — se conservó), ni
`TODO`/`FIXME`/`HACK` reales, ni código comentado muerto, ni archivos de
Playwright/capturas/notas personales. Ninguno de esos elementos existía en
el ZIP recibido para esta sesión.

---

## Validaciones realizadas

- `npm install` (monorepo completo, 378 paquetes) → OK
- **Frontend:** `npx tsc --noEmit -p tsconfig.app.json` → **0 errores**
- **Frontend:** `npm run build` (`tsc -b && vite build`) → **build exitoso**
- **Backend:** `npx tsc --noEmit -p tsconfig.json` → 7 errores, **idénticos antes y después de todos los cambios de esta sesión**. Los 7 son exclusivamente por no poder descargar el motor de consultas de Prisma (`binaries.prisma.sh`, bloqueado en este entorno de pruebas aislado de red) — no corresponden a ningún archivo tocado en esta sesión (ninguno pertenece al módulo `auth`) y no existen en un entorno donde `npx prisma generate` se complete con normalidad.
- Revisión manual archivo por archivo del `GET /auth/me` contra el patrón ya usado en `login`/`logout` (mismo pipeline Route → JWT → Service → Repository → Prisma, mismo estilo de DTO/mapper)
- Revisión manual de que cada `recurso` usado en `RequierePermiso` corresponde exactamente al que ya usa cada `*.routes.ts` del backend en su `authorize(recurso, accion)` (no se inventó ningún nombre de recurso nuevo)

## Confirmación de que no se modificó ninguna funcionalidad existente

- No se tocó Prisma, `schema.prisma`, migraciones, JWT, ni las reglas de
  negocio/cálculos ya implementados.
- Ninguna ruta existente cambió de path, método o componente — solo se
  añadió una capa de `RequierePermiso` alrededor de los grupos ya existentes.
- `GET /auth/me` es un endpoint nuevo, aditivo; no reemplaza ni modifica
  `login`/`logout`.
- `RolesTable.tsx` se eliminó porque `RoleCard.tsx` la reemplaza por completo
  (mismo dato, misma fuente `useRoles()`); ningún otro archivo dependía de
  `RolesTable`.
- El resto de módulos (activos, amenazas, vulnerabilidades, riesgos,
  controles, reportes, contexto, organización, y los formularios de edición
  de usuario) no se tocaron.

## Auditoría de archivos huérfanos (segunda pasada, sobre el proyecto completo)

Tras la entrega inicial se realizó una búsqueda exhaustiva de componentes,
hooks, utilidades y páginas sin referencias en todo el proyecto (139
archivos backend + 139 archivos frontend, comparando cada nombre de archivo
contra el resto del código con coincidencia de límite de palabra, no solo
substring, para evitar falsos positivos).

- **`RolesTable.tsx`** — huérfano confirmado (reemplazado por completo por
  `RoleCard.tsx`; ninguna otra parte del código lo importaba ni lo
  mencionaba). Ya estaba eliminado como parte de la Tarea 4 de esta misma
  entrega (ver arriba); esta segunda pasada solo lo confirma.
- **Frontend:** 0 huérfanos adicionales.
- **Backend:** el único archivo sin referencias de otro `.ts` es
  `src/server.ts`, pero es el punto de entrada del proceso (declarado en
  `package.json`: `"main": "dist/server.js"`, scripts `dev`/`start`), no un
  huérfano — no se toca.

Recompilación tras la auditoría: frontend `tsc --noEmit` → 0 errores; backend
`tsc --noEmit` → los mismos 7 errores preexistentes de siempre (motor de
Prisma no descargable en este entorno aislado de red), sin cambios.

## Mensaje de commit sugerido

```
feat(fase-6): permisos dinamicos (GET /auth/me), rediseno de roles y modo oscuro

- Backend: nuevo endpoint GET /auth/me (perfil + permisos reales del usuario autenticado)
- Frontend: usePerfilActual, ConPermiso, RequierePermiso, AccesoRestringidoPage;
  menu y rutas protegidas por permiso real en vez de una lista fija
- Roles: RoleCard reemplaza a RolesTable (permisos agrupados, contador de usuarios)
- Tema claro/oscuro: ThemeProvider + ThemeToggle + tokens CSS/Tailwind,
  aplicado a App, AppShell, Login, Dashboard, Roles y Usuarios
- Limpieza: PDFs de prueba, dist/ y *.tsbuildinfo fuera del repo (ya en .gitignore)

No se modifico Prisma, JWT, reglas de negocio ni rutas existentes.
```
(No se generó ningún commit real — solo se sugiere el mensaje, como se pidió.)
