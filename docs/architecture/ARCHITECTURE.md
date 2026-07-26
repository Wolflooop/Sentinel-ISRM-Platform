# Arquitectura — Sentinel ISRM

## 1. Visión general

Sentinel ISRM es una plataforma SaaS multiempresa (multi-tenant) de Gestión de
Riesgos de Seguridad de la Información basada en **ISO/IEC 27005**. El
sistema está organizado como un **monorepo** con dos aplicaciones
independientes que se comunican exclusivamente vía HTTP/JSON:

```
sentinel-isrm/
├── apps/
│   ├── backend/     API REST (Node.js + Express + Prisma + PostgreSQL)
│   └── frontend/    SPA (React + TypeScript + Vite + Tailwind)
├── package.json     Workspace raíz (npm workspaces)
└── package-lock.json
```

El `package.json` raíz declara `apps/backend` y `apps/frontend` como
workspaces de npm y expone scripts agregados (`dev:backend`, `dev:frontend`,
`build:backend`, `build:frontend`, `prisma:generate`,
`prisma:migrate:dev`, `prisma:migrate:deploy`) que delegan en el script
equivalente de cada workspace.

## 2. Backend

### 2.1 Stack

- **Node.js** ≥ 20, **TypeScript**, **Express 4**
- **Prisma 5** como ORM sobre **PostgreSQL**
- **Zod** para validación de entrada
- **jsonwebtoken** + **bcrypt** para autenticación
- **helmet**, **cors**, **express-rate-limit** para endurecimiento HTTP
- **winston** + **morgan** para logging
- **pdfkit** para generación de reportes PDF
- **multer** para carga de archivos (evidencias)

### 2.2 Punto de entrada

- `src/server.ts`: arranca el servidor HTTP invocando `createApp()`.
- `src/app.ts` (`createApp`): construye la instancia de Express, monta
  middleware global (Helmet, CORS, parsers JSON/urlencoded, logger de
  peticiones), expone `GET /health`, aplica el rate limiter general a todo
  `/api`, y monta cada router de módulo bajo su prefijo `/api/<recurso>`.

### 2.3 Organización por módulos (arquitectura modular)

El código de dominio vive en `src/modules/<nombre-modulo>/`. Cada módulo seguido
por el backend replica la misma subestructura interna:

```
modules/<modulo>/
├── controller/   Adaptador HTTP: parsea request, invoca el service, arma la respuesta
├── dto/          Formas de entrada/salida expuestas por el controller
├── mapper/       Transforma entidades Prisma → DTOs de respuesta
├── repository/   Único punto de acceso a Prisma Client para ese módulo
├── routes/       Define el Router de Express y la cadena de middleware por endpoint
├── schema/       Esquemas Zod de validación de entrada
├── service/      Lógica de negocio, reglas de dominio, orquestación de repositorios
└── types/        Tipos TypeScript internos del módulo
```

Este patrón se aplica de forma consistente en los 22 módulos existentes bajo
`src/modules/`: `assets`, `audit`, `auth`, `comments`, `context`, `controls`,
`dashboard`, `evaluations`, `evidence`, `follow-ups`, `history`,
`organizations`, `permissions`, `reports`,
`risk-identification-categories`, `risk-resolutions`, `risks`, `roles`,
`security-events`, `threats`, `treatments`, `users`, `vulnerabilities`
(el módulo `history` expone únicamente `repository`/`service`/`types`, sin
capa HTTP propia, ya que su lógica es consumida internamente por otros
módulos para registrar `RiesgoHistorial`/`ControlHistorial`).

### 2.4 Flujo de una petición

Toda petición autenticada atraviesa la misma cadena de responsabilidades, en
este orden estricto:

```
Route
  ↓
JWT Authentication   (middleware authenticate)
  ↓
RBAC                 (middleware authorize / requireTipoRol)
  ↓
Zod Validation       (schema.parse dentro del controller)
  ↓
Controller           (adaptador HTTP puro)
  ↓
Service               (reglas de negocio)
  ↓
Repository            (acceso a datos)
  ↓
Prisma
  ↓
PostgreSQL
```

Detalle de cada etapa:

1. **Route** (`routes/*.routes.ts`): declara el `Router` de Express, monta
   `authenticate` con `router.use(authenticate)` para todas las rutas del
   módulo (salvo `POST /api/auth/login`, que es pública), y por cada
   endpoint específico compone `authorize(recurso, accion)` y, cuando aplica,
   `requireTipoRol(...)` antes del controller.
2. **JWT Authentication** (`middleware/authenticate.ts`): extrae el Bearer
   token, lo verifica contra `JWT_SECRET`, confirma que exista una `Sesion`
   activa y no revocada asociada al hash del token, y adjunta el payload
   verificado en `req.user`. Registra un `EventoSeguridad` en cada rechazo
   (`AUTH_ACCESS_DENIED`, `AUTH_SESSION_EXPIRED`).
3. **RBAC** (`middleware/authorize.ts` y `middleware/requireTipoRol.ts`):
   - `authorize(recurso, accion)` consulta los permisos asociados al
     `rolId` del token y exige que exista un permiso exacto
     `{recurso, accion}`.
   - `requireTipoRol(...tipos)` es una barrera jerárquica independiente,
     basada en `TipoRol` (`SUPER_ADMIN` / `ADMIN_TIC` / `USUARIO_COMUN`), que
     se usa junto a `authorize` (nunca en su lugar) para operaciones que
     dependen del nivel jerárquico del actor y no de un permiso asignable
     dinámicamente (p. ej. crear organizaciones, crear usuarios).
4. **Zod Validation**: cada `controller` valida `req.body`/`req.query` contra
   un esquema Zod definido en `schema/*.schema.ts` antes de invocar al
   service. Los errores de validación son capturados por el
   `errorHandler` global y devueltos como `400`.
5. **Controller** (`controller/*.controller.ts`): capa delgada — parsea la
   entrada, resuelve el actor/organización desde `req.user`, invoca al
   `service`, mapea el resultado a DTO (`mapper/*.mapper.ts`) y define el
   código de estado HTTP de la respuesta. No contiene lógica de negocio.
6. **Service** (`service/*.service.ts`): concentra las reglas de negocio
   (validaciones cruzadas, invariantes del dominio ISO/IEC 27005, orquestación
   de auditoría). Es la única capa que decide *qué* hacer; delega el *cómo*
   persistirlo al repository.
7. **Repository** (`repository/*.repository.ts`): único punto de contacto
   con `PrismaClient` para el módulo. Encapsula las consultas Prisma
   (`findMany`, `create`, transacciones `prisma.$transaction`, etc.).
8. **Prisma → PostgreSQL**: el ORM traduce las llamadas del repository a SQL
   sobre la base de datos PostgreSQL definida en `DATABASE_URL`.

### 2.5 Capa compartida (`src/shared/`)

- `AppError.ts`: clase de error de aplicación con `status` HTTP explícito,
  usada por todos los módulos para señalar errores de negocio controlados.
- `jwt.ts`: firma/verificación de JWT (`signAuthToken`, `verifyAuthToken`) y
  hashing de tokens (`hashToken`, SHA-256) para su almacenamiento en `Sesion`.
- `password.ts`: hashing y comparación de contraseñas con `bcrypt`
  (10 salt rounds).
- `audit.ts`: helper único para escribir registros de `Auditoria` dentro de
  la misma transacción Prisma que realiza el cambio de negocio, y para
  resolver el `organizacionId` de auditoría cuando el actor es un
  `SUPER_ADMIN` (que no pertenece a ninguna organización), usando la
  organización técnica `__SISTEMA__` creada por el seed.
- `ownership.ts`: reglas de "gestión por responsable" (`canManageRegistro`,
  `canReasignarRegistro`) aplicadas en la capa de servicio, complementarias
  (no sustitutas) del RBAC por recurso/acción.

### 2.6 Middleware transversal (`src/middleware/`)

| Middleware | Responsabilidad |
|---|---|
| `authenticate` | Verifica JWT y sesión activa; puebla `req.user` |
| `authorize(recurso, accion)` | RBAC dinámico por permiso |
| `requireTipoRol(...tipos)` | Barrera jerárquica por `TipoRol` |
| `rateLimiters` | `authLimiter`, `apiLimiter`, `refreshLimiter` (express-rate-limit) |
| `errorHandler` / `notFoundHandler` | Normaliza errores (`ZodError`, `AppError`, genéricos) a JSON |
| `requestLogger` | Logging de peticiones HTTP vía morgan + winston |
| `uploadEvidencia` | Multer configurado para la carga de archivos de evidencia |

## 3. Frontend

### 3.1 Stack

- **React 18** + **TypeScript** + **Vite 5**
- **React Router v6** para enrutamiento
- **TanStack React Query** para estado de servidor (fetching, caché,
  invalidación)
- **React Hook Form** + **Zod** (`@hookform/resolvers`) para formularios
- **Tailwind CSS** para estilos
- **Axios** como cliente HTTP
- **Chart.js** / **react-chartjs-2** para visualizaciones del dashboard
- **lucide-react** para iconografía

### 3.2 Organización por features

```
apps/frontend/src/
├── components/     Componentes compartidos de UI (ConPermiso, ThemeToggle, Timeline, ...)
├── features/       Un directorio por dominio funcional
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── schemas/    (validación Zod de formularios)
│       ├── services/   (llamadas HTTP vía apiClient)
│       └── types/
├── layouts/
├── lib/             apiClient, tokenStorage, authSession, permissions, theme
├── routes/          AppRouter y guards de enrutamiento
├── App.tsx
└── main.tsx
```

Features existentes: `assets`, `audit`, `auth`, `comments`, `context`,
`controls`, `dashboard`, `evaluations`, `evidence`, `follow-ups`,
`organizations`, `reports`, `risk-matrix`, `risk-resolutions`, `risks`,
`roles`, `security-events`, `shell`, `threats`, `treatments`, `users`,
`vulnerabilities`.

### 3.3 Cliente HTTP (`lib/apiClient.ts`)

Instancia única de Axios (`baseURL` desde `VITE_API_BASE_URL`) con:

- Interceptor de **request** que adjunta `Authorization: Bearer <token>`
  leyendo el token desde `tokenStorage`.
- Interceptor de **response** que centraliza el manejo de errores HTTP:
  - `401` (excepto en `/auth/login` y `/auth/logout`) → limpia el token y
    redirige a `/login`.
  - `403` → publica una notificación de "acceso denegado" vía
    `httpNotifications`.
  - `500` → publica una notificación de error de servidor.

### 3.4 Enrutamiento y guards (`routes/`)

`AppRouter.tsx` define el árbol de rutas con `react-router-dom` v6 y compone
varios guards anidados:

- `ProtectedRoute`: exige sesión válida (`hasValidSession`), si no,
  redirige a `/login`.
- `RequierePermiso(recurso, accion)`: oculta/bloquea rutas cuyo permiso RBAC
  no está presente en el perfil actual (espejo en frontend del `authorize`
  del backend, solo a efectos de UX — la autorización real siempre la
  aplica el backend).
- `RequiereTipoRol(tipoRol)`: espejo de `requireTipoRol` del backend, para
  rutas administrativas globales (p. ej. `/organizaciones`, exclusiva de
  `SUPER_ADMIN`).
- `RequiereOrganizacion`: bloquea el acceso a módulos operativos (Contexto,
  Activos, Amenazas, Vulnerabilidades, Riesgos, Reportes, Auditoría, Eventos
  de seguridad) cuando el usuario actual no pertenece a ninguna
  organización (caso `SUPER_ADMIN`).

### 3.5 RBAC en el frontend (`lib/permissions.ts`)

- `tienePermiso(permisos, recurso, accion)`: evalúa si el perfil actual tiene
  un permiso exacto — usado por `RequierePermiso` y por el componente
  `ConPermiso` para condicionar botones/acciones dentro de una misma
  pantalla.
- `puedeGestionarRegistro` / `puedeReasignarRegistro`: espejo en frontend de
  `shared/ownership.ts` del backend, para decidir qué controles mostrar
  según si el usuario es el responsable del registro. El backend sigue
  siendo la única fuente real de autorización; estas funciones solo evitan
  mostrar acciones que el backend rechazaría.

La barra de navegación (`SidebarNav`) construye su lista de ítems visibles
dinámicamente a partir de los permisos efectivos del usuario (no de
`TipoRol` hardcodeado), lo que permite que roles personalizados con
permisos distintos a los predefinidos vean un menú coherente con lo que
realmente pueden hacer.

## 4. Módulos funcionales del dominio

Los módulos de negocio expuestos por la API y reflejados en la navegación
del frontend son:

| Módulo | Responsabilidad |
|---|---|
| **Auth** | Login, logout, perfil del usuario autenticado |
| **Users** (Usuarios) | Gestión de usuarios de una organización |
| **Roles** | Catálogo de roles y asignación de permisos |
| **Permissions** (Permisos) | Consulta del catálogo global de permisos |
| **Organizations** (Organizaciones) | Alta y autogestión de organizaciones (tenants) |
| **Dashboard** | Indicadores globales de la plataforma (solo `SUPER_ADMIN`) y de la organización |
| **Context** (Contexto ISO) | Alcance, criterios de aceptación, escalas de impacto/probabilidad y matriz de riesgo |
| **Assets** (Activos) | Inventario de activos de información |
| **Threats** (Amenazas) | Catálogo de amenazas (globales o propias de la organización) |
| **Vulnerabilities** (Vulnerabilidades) | Catálogo de vulnerabilidades (globales o propias) |
| **Risks** (Riesgos) | Identificación de riesgos (origen AAV o MANUAL), historial de estado |
| **Risk Identification Categories** | Catálogo de categorías para riesgos de origen MANUAL |
| **Evaluations** (Evaluaciones) | Cálculo de probabilidad × impacto (inherente/residual) |
| **Risk Resolutions** (Resoluciones de riesgo) | Resolución y reapertura de riesgos |
| **Treatments** (Tratamientos) | Estrategia de tratamiento y avance de ejecución |
| **Controls** (Controles) | Catálogo de controles y su estado de implementación |
| **Comments** (Comentarios) | Comentarios polimórficos sobre Riesgo/Evaluación/Tratamiento/Control |
| **Follow-ups** (Seguimientos) | Seguimientos polimórficos sobre Riesgo/Tratamiento/Control |
| **Evidence** (Evidencias) | Carga, validación y descarga de evidencia documental |
| **Reports** (Reportes) | Generación y descarga de reportes PDF (Ejecutivo/Técnico/General) |
| **Audit** (Auditoría) | Consulta del rastro de auditoría de operaciones CRUD |
| **Security Events** (Eventos de seguridad) | Consulta del registro de eventos de autenticación/sesión |

## 5. Aislamiento multi-tenant

El aislamiento entre organizaciones (tenants) se aplica de dos formas
según el modelo:

- **Directo**: modelos con `organizacionId` propio (`Usuario`, `Activo`,
  `Contexto`, `Auditoria`, `Reporte`, `EventoSeguridad`, y opcionalmente
  `Amenaza`/`Vulnerabilidad`/`Control` cuando no son catálogo global).
  Los repositories filtran siempre por el `organizacionId` resuelto desde
  `req.user`.
- **Indirecto (vía JOIN)**: `Riesgo`, `Evaluacion`, `Tratamiento` no tienen
  `organizacionId` propio; su pertenencia a una organización se resuelve
  a través de la cadena `Riesgo → AAV → Activo → Organizacion` (origen AAV)
  o `Riesgo → creador → Organizacion` (origen MANUAL). Esta decisión evita
  duplicar el `organizacionId` en cada entidad derivada del análisis de
  riesgo.

El `SUPER_ADMIN` es un usuario global (`Usuario.organizacionId = null`) y no
opera sobre los módulos organizacionales: tanto el backend
(`organizacionIdDe(req)` en los controllers) como el frontend
(`RequiereOrganizacion`) rechazan/ocultan esas rutas para ese tipo de rol.
