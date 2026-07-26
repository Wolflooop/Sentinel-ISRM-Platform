# Guía de Desarrollo — Sentinel ISRM

## 1. Requisitos

- **Node.js** ≥ 20.0.0 (declarado en `engines` del `package.json` raíz)
- **npm** (el proyecto usa npm workspaces, no yarn/pnpm)
- **PostgreSQL** accesible (local o remoto) para `DATABASE_URL`

## 2. Instalación local

Desde la raíz del repositorio (monorepo con workspaces `apps/backend` y
`apps/frontend`):

```bash
# Instala dependencias de ambos workspaces con una sola invocación
npm install
```

### 2.1 Variables de entorno — backend

Copiar `apps/backend/.env.example` a `apps/backend/.env` y completar:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | Puerto HTTP del backend | `4000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | — (obligatoria) |
| `JWT_SECRET` | Secreto de firma JWT | — (obligatoria) |
| `JWT_EXPIRES_IN` | Expiración del token (`1h`, `30m`, etc.) | `1h` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |
| `RATE_LIMIT_ENABLED` | `true`/`false` — activa/desactiva todos los rate limiters | `true` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Ventana del limiter de auth (ms) | `900000` |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Máximo de intentos por ventana en `/auth/login` | `10` |
| `API_RATE_LIMIT_WINDOW_MS` | Ventana del limiter general de `/api` (ms) | `60000` |
| `API_RATE_LIMIT_MAX_REQUESTS` | Máximo de peticiones por ventana en `/api` | `500` |
| `LOG_LEVEL` | Nivel de log de winston | `info` |
| `AUTH_MAX_INTENTOS_FALLIDOS` | Intentos fallidos antes de bloquear la cuenta (opcional) | — |
| `AUTH_BLOQUEO_MINUTOS` | Minutos de bloqueo temporal (opcional) | — |
| `SEED_ADMIN_EMAIL` | Correo del `SUPER_ADMIN` sembrado por `prisma:seed` | `admin@sentinel.local` |
| `SEED_ADMIN_PASSWORD` | Contraseña del `SUPER_ADMIN` sembrado — sin esta variable el seed no crea el usuario | — |

### 2.2 Variables de entorno — frontend

Copiar `apps/frontend/.env.example` a `apps/frontend/.env`:

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API consumida por el frontend | `http://localhost:4000/api` |

### 2.3 Base de datos

```bash
# Generar el cliente Prisma
npm run prisma:generate

# Aplicar migraciones en desarrollo (crea la base si no existe)
npm run prisma:migrate:dev

# Sembrar datos globales (roles, permisos, catálogos ISO, usuario SUPER_ADMIN)
npm run prisma:seed --workspace=apps/backend
```

## 3. Comandos npm

### 3.1 Raíz del monorepo (`package.json`)

| Comando | Descripción |
|---|---|
| `npm run dev:backend` | Ejecuta el backend en modo desarrollo (delega a `apps/backend`) |
| `npm run dev:frontend` | Ejecuta el frontend en modo desarrollo (delega a `apps/frontend`) |
| `npm run build:backend` | Compila el backend a `apps/backend/dist` |
| `npm run build:frontend` | Compila el frontend a `apps/frontend/dist` |
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run prisma:migrate:dev` | Aplica migraciones en desarrollo |
| `npm run prisma:migrate:deploy` | Aplica migraciones en producción (sin generar nuevas) |

### 3.2 `apps/backend/package.json`

| Comando | Descripción |
|---|---|
| `npm run dev` | `tsx watch src/server.ts` — servidor con recarga en caliente |
| `npm run build` | `tsc -p tsconfig.json` — compila TypeScript a `dist/` |
| `npm run start` | `node dist/server.js` — ejecuta el build de producción |
| `npm run prisma:generate` | `prisma generate` |
| `npm run prisma:migrate:dev` | `prisma migrate dev` |
| `npm run prisma:migrate:deploy` | `prisma migrate deploy` |
| `npm run prisma:studio` | Abre Prisma Studio (explorador visual de datos) |
| `npm run prisma:seed` | `tsx prisma/seed.ts` — ejecuta el seed idempotente |

### 3.3 `apps/frontend/package.json`

| Comando | Descripción |
|---|---|
| `npm run dev` | `vite` — servidor de desarrollo con HMR |
| `npm run build` | `tsc -b && vite build` — type-check + build de producción |
| `npm run preview` | Sirve localmente el build de producción para verificación |
| `npm run lint` | `eslint .` |

## 4. Desarrollo backend

- Punto de entrada de desarrollo: `apps/backend/src/server.ts`, ejecutado
  con `tsx watch` (recompila y reinicia en cada cambio).
- La configuración de entorno se valida al arrancar (`src/config/env.ts`,
  esquema Zod): si falta una variable obligatoria (`DATABASE_URL`,
  `JWT_SECRET`) el proceso falla inmediatamente con un mensaje explícito.
- Al añadir un endpoint nuevo, seguir siempre la cadena de capas del
  módulo correspondiente (`route → controller → service → repository`,
  ver `ARCHITECTURE.md`): la validación Zod vive en `schema/`, la lógica de
  negocio en `service/`, y el acceso a Prisma exclusivamente en
  `repository/`.
- Cualquier escritura que deba auditarse debe hacerse dentro de una misma
  transacción Prisma (`prisma.$transaction`) que también invoque
  `registrarAuditoria` (`shared/audit.ts`).
- Los archivos subidos (evidencias) se almacenan bajo
  `apps/backend/storage/evidencias/`; los reportes PDF generados, bajo
  `apps/backend/storage/reports/`. Ambos directorios están excluidos de
  control de versiones salvo un `.gitignore` de marcador.

## 5. Desarrollo frontend

- Servidor de desarrollo: `vite` sobre `apps/frontend`, con recarga en
  caliente (HMR).
- Cada dominio funcional nuevo se organiza como un feature bajo
  `src/features/<nombre>/`, replicando la subestructura existente
  (`components/`, `hooks/`, `pages/`, `schemas/`, `services/`, `types/`).
- Las llamadas HTTP se realizan siempre a través de la instancia
  compartida `apiClient` (`src/lib/apiClient.ts`), nunca con `axios`/`fetch`
  directamente, para heredar el interceptor de autenticación y el manejo
  centralizado de errores `401`/`403`/`500`.
- Las rutas nuevas se registran en `src/routes/AppRouter.tsx`, envueltas en
  los guards correspondientes (`ProtectedRoute`, `RequierePermiso`,
  `RequiereTipoRol`, `RequiereOrganizacion`) según el nivel de acceso
  requerido — replicando siempre la misma regla que ya aplica el backend
  en su `router.use`/`authorize`/`requireTipoRol` equivalente.
- Los formularios usan `react-hook-form` + `@hookform/resolvers/zod` con
  esquemas Zod definidos en `schemas/` de cada feature, idealmente
  espejando las reglas del `schema/*.schema.ts` correspondiente del
  backend.

## 6. Build

```bash
# Backend: compila TypeScript a apps/backend/dist (ejecutar con `npm run start`)
npm run build:backend

# Frontend: type-check + bundle de producción a apps/frontend/dist
npm run build:frontend
```

Ambos comandos deben ejecutarse sin errores como validación mínima antes de
integrar cambios; no requieren una base de datos accesible (el build del
backend es solo compilación TypeScript, no ejecuta migraciones).
