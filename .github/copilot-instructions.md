# Instrucciones para GitHub Copilot — Sentinel ISRM Platform

Cualquier agente (GitHub Copilot u otro) que trabaje en este repositorio debe cumplir lo siguiente **antes** de generar o modificar código:

---

## Fuentes Normativas del Proyecto

### 1. Constitución del Proyecto (Única Fuente Normativa)

**Leer completamente:** [`docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md`](../docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md)

Es la única fuente normativa vigente del proyecto. Todas las decisiones técnicas y de alcance deben derivarse de este documento.

### 2. Modelo de Datos (Única Fuente Física de Verdad)

**Respetar como fuente física única de verdad:**

- `database/schema.prisma`
- `apps/backend/prisma/schema.prisma`

Ninguna otra fuente puede contradecir la estructura definida en Prisma. No crear entidades, tablas, campos, enums o relaciones nuevas que no existan ya en `schema.prisma`.

---

## Restricciones en Modificaciones del Modelo de Datos

**No modificar `schema.prisma`** sin autorización explícita del responsable del proyecto.

**Cuando una modificación sea aprobada:**

- Utilizar Prisma Migration
- Mantener compatibilidad con PostgreSQL
- Actualizar relaciones, validaciones y código dependiente
- Nunca realizar cambios mediante SQL manual
- Usar `prisma migrate dev` (desarrollo) o `prisma migrate deploy` (producción)

---

## Arquitectura Obligatoria

**Mantener siempre la siguiente arquitectura de capas:**

```
Route
  ↓
JWT Middleware
  ↓
RBAC Middleware
  ↓
Zod Validation
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma Client
  ↓
PostgreSQL
```

### Responsabilidades por Capa

**Controllers:**
- Solo manejan HTTP
- No contienen lógica de negocio
- No utilizan Prisma directamente

**Services:**
- Contienen lógica de negocio
- Implementan reglas relacionadas con ISO/IEC 27005
- No utilizan Express
- No acceden directamente a Prisma

**Repositories:**
- Único lugar autorizado para utilizar Prisma Client
- Manejan todas las operaciones de base de datos

**Respuestas:**

Siempre seguir el flujo:

```
Prisma Model → Mapper → DTO → Controller Response
```

- Nunca devolver objetos Prisma directamente
- Nunca exponer `passwordHash`

---

## Lenguaje y Tecnologías

**Utilizar exclusivamente:**

- TypeScript (`.ts`)
- React TypeScript (`.tsx`)

Excepto archivos de configuración que requieran otro formato por exigencia de una herramienta específica.

---

## Gestión de Información Faltante

**No inventar información.**

Si algo no está definido en:

- Project Constitution
- Modelo Prisma
- Alcance de la fase actual

**Responder únicamente:**

> Información pendiente de definición.

Y detener únicamente esa parte de la implementación.

---

## Restricciones de Alcance

**No generar:**

- Documentación adicional de arquitectura
- Nuevos resúmenes del proyecto
- Cambios fuera del módulo solicitado
- Funcionalidades fuera de la fase actual

**La fase actual es:** Desarrollo

---

## Orden Oficial de Desarrollo

**Seguir estrictamente el orden definido en la Sección 13 de la Constitución:**

- Trabajar módulo por módulo
- No avanzar a fases posteriores sin aprobación
- Esperar confirmación antes de cada nueva fase

### Fases Completadas

1. Fase 1 — Organización
2. Fase 2 — Contexto ISO/IEC 27005
3. Fase 3 — Activos
4. Fase 4 — Amenazas
5. Fase 5 — Vulnerabilidades
6. Fase 6 — Relaciones AAV
7. Fase 7 — Modelo de Riesgo
8. Fase 8 — Validaciones arquitectónicas
9. Fase 9 — Gestión de Riesgos

### Fase Actual

**Fase 10 — Evaluaciones de Riesgo**

Objetivo: Implementar el módulo de evaluación de riesgos sobre los riesgos existentes.

---

## Lo que NO Debe Desarrollarse Todavía

- Dashboard
- Reportes
- Exportaciones PDF
- Despliegue
- Funcionalidades fuera de Fase 10

---

## Módulos Protegidos (Sin Autorización de Cambios)

No modificar sin autorización explícita:

- Usuarios y autenticación
- Roles y permisos
- Activos
- Amenazas
- Vulnerabilidades
- Relaciones AAV
- Modelo actual de Riesgos
- Auditoría
- Multi-tenancy

---

## Regla de Cambios Mínimos

**Toda modificación debe ser incremental.**

**Está prohibido:**

- Refactorizar módulos existentes sin autorización
- Cambiar nombres existentes
- Reorganizar carpetas completas
- Modificar patrones arquitectónicos
- Reemplazar tecnologías actuales

Solo implementar la funcionalidad solicitada.

---

## Flujo Obligatorio Antes de Generar Código

**Antes de modificar archivos:**

1. Identificar archivos afectados
2. Explicar qué archivos serán modificados
3. Confirmar compatibilidad con la arquitectura existente
4. Esperar aprobación antes de generar cambios grandes

---

## Validación Antes de Entregar Cambios

**Antes de considerar una tarea terminada, verificar:**

- ✓ TypeScript sin errores
- ✓ Arquitectura de capas respetada
- ✓ No existen accesos Prisma fuera de Repository
- ✓ No existen respuestas con modelos Prisma directos
- ✓ No existen secretos expuestos
- ✓ La funcionalidad pertenece únicamente a la fase actual
