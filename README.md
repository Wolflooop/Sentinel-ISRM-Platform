# Sentinel ISRM Platform

Plataforma web multiorganizacional (multi-tenant lógico) para la gestión de riesgos de seguridad de la información, basada en **ISO/IEC 27005:2022**.

> Fuente de verdad del proyecto: [`docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md`](./docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md). Cualquier duda de arquitectura, alcance o modelo de datos se resuelve ahí, no en este README.

## Estado del proyecto

**Fase 1 — Infraestructura base.** Solo existe el andamiaje inicial (backend Express + Prisma, frontend React + Vite). Ningún módulo funcional (auth, activos, riesgos, etc.) está implementado todavía.

## Stack tecnológico

**Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router DOM, Axios, React Hook Form, Zod, TanStack Query, Chart.js, Lucide React.

**Backend:** Node.js LTS, Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcrypt, Helmet, express-rate-limit, Winston, Morgan, Zod.

## Estructura del monorepo

```
sentinel-isrm/
├── apps/
│   ├── backend/     Express + Prisma + TypeScript
│   └── frontend/    React + Vite + TypeScript
├── database/
│   └── schema.prisma    Fuente física única del modelo de datos (no modificar sin autorización)
├── docs/
│   └── PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md
├── .github/
│   └── copilot-instructions.md
└── package.json     Workspaces npm
```

## Requisitos previos

- Node.js >= 20
- PostgreSQL en ejecución (local o remoto)
- npm >= 10

## Instalación

```bash
npm install
```

Esto instala las dependencias de `apps/backend` y `apps/frontend` mediante npm workspaces.

## Variables de entorno

Copia los archivos de ejemplo y completa los valores reales (nunca se versionan valores reales):

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

## Levantar el backend

```bash
npm run dev:backend
```

## Levantar el frontend

```bash
npm run dev:frontend
```

## Base de datos (Prisma)

Toda modificación del modelo de datos se realiza **exclusivamente** mediante Prisma. Nunca se modifican tablas directamente en PostgreSQL.

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Desarrollo — crea y aplica una migración versionada
npm run prisma:migrate:dev

# Producción — aplica migraciones ya generadas
npm run prisma:migrate:deploy
```

> El archivo `apps/backend/prisma/schema.prisma` es un espejo exacto de `database/schema.prisma` (fuente única de verdad del modelo de datos), colocado ahí únicamente porque la CLI de Prisma requiere el archivo dentro del paquete que lo ejecuta. Ningún archivo debe editarse de forma independiente del otro.

## Convenciones

Ver Secciones 11, 14, 15 y 16 de la [PROJECT CONSTITUTION](./docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md) para convenciones de código, lenguaje, migraciones y control de versiones.
