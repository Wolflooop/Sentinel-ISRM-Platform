# Sentinel ISRM Platform

Plataforma web multiorganizacional (multi-tenant lógico) para la gestión
de riesgos de seguridad de la información, basada en **ISO/IEC
27005:2022**.

## Descripción general

Sentinel ISRM permite a una organización identificar sus activos de
información, las amenazas y vulnerabilidades que los afectan, evaluar el
riesgo resultante, definir tratamientos y controles, y dar seguimiento a
todo el ciclo de vida del riesgo, con auditoría y control de acceso
basado en roles.

## Objetivo del sistema

Ofrecer una herramienta centralizada que permita a distintas
organizaciones (tenants) administrar de forma aislada e independiente su
propio proceso de gestión de riesgos de seguridad de la información,
siguiendo el marco de trabajo de ISO/IEC 27005.

## Estado del proyecto

Backend y frontend con los módulos funcionales implementados:
autenticación JWT, usuarios, roles, permisos, organizaciones, contexto
ISO, activos, amenazas, vulnerabilidades, riesgos (identificación,
evaluación, tratamiento y control), comentarios, seguimientos, evidencias,
reportes, auditoría y eventos de seguridad.

## Stack tecnológico

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router DOM,
Axios, React Hook Form, Zod, TanStack Query, Chart.js, Lucide React.

**Backend:** Node.js LTS, Express, TypeScript, Prisma ORM, PostgreSQL,
JWT, bcrypt, Helmet, express-rate-limit, Winston, Morgan, Zod.

## Estructura del monorepo

```
sentinel-isrm/
├── apps/
│   ├── backend/
│   └── frontend/
├── docs/
│   ├── README.md
│   ├── architecture/
│   ├── security/
│   ├── api/
│   ├── database/
│   ├── development/
│   └── user-guide/
└── package.json
```

## Requisitos previos

- Node.js >= 20
- PostgreSQL en ejecución (local o remoto)
- npm >= 10

## Instalación

```bash
npm install
```

Esto instala las dependencias de `apps/backend` y `apps/frontend`
mediante npm workspaces.

Copia los archivos de variables de entorno de ejemplo y completa los
valores reales (nunca se versionan valores reales):

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

## Ejecución local

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend
```

## Configuración básica de base de datos

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Desarrollo — crea y aplica una migración versionada
npm run prisma:migrate:dev

# Producción — aplica migraciones ya generadas
npm run prisma:migrate:deploy
```

Para más detalle sobre el modelo de datos, ver la documentación técnica.

## Documentación

La documentación técnica detallada del proyecto vive en
[`docs/`](./docs/README.md):

- [Arquitectura](./docs/architecture/ARCHITECTURE.md)
- [Seguridad](./docs/security/SECURITY.md)
- [API](./docs/api/API.md)
- [Base de datos](./docs/database/DATABASE.md)
- [Desarrollo](./docs/development/DEVELOPMENT.md)
- [Guía de usuario](./docs/user-guide/USER_GUIDE.md)