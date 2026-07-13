# Instrucciones para GitHub Copilot — Sentinel ISRM Platform

Cualquier agente (GitHub Copilot u otro) que trabaje en este repositorio debe cumplir lo siguiente **antes** de generar o modificar código:

1. **Leer completamente** [`docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md`](../docs/PROJECT_CONSTITUTION_SENTINEL_ISRM_v1.0.md). Es la única fuente normativa vigente del proyecto.
2. **Respetar `database/schema.prisma` (y su espejo en `apps/backend/prisma/schema.prisma`) como fuente física única de verdad** del modelo de datos. Ninguna otra fuente puede contradecirlo en materia de estructura de datos.
3. **No crear entidades, tablas, campos, enums o relaciones nuevas** que no existan ya en `schema.prisma`.
4. **No modificar `schema.prisma`** sin autorización explícita del responsable del proyecto.
5. **Mantener siempre la arquitectura de capas obligatoria:**
   ```
   Route → JWT Middleware → RBAC Middleware → Zod Validation → Controller → Service → Repository → Prisma → PostgreSQL
   ```
   - Controllers: solo HTTP, sin lógica de negocio, sin Prisma.
   - Services: lógica de negocio e ISO/IEC 27005, sin Express, sin Prisma directo.
   - Repositories: único lugar autorizado para usar Prisma Client.
   - Toda respuesta pasa por `Prisma Model → Mapper → DTO → Controller Response`; nunca se devuelve un objeto Prisma crudo ni se expone `passwordHash`.
6. **Usar TypeScript exclusivamente** (`.ts` / `.tsx`) en frontend y backend, salvo archivos de configuración que una herramienta específica requiera en otro formato.
7. **No modificar la base de datos directamente.** Todo cambio de esquema pasa por `prisma migrate dev` (desarrollo) o `prisma migrate deploy` (producción), nunca por SQL manual.
8. **No inventar información faltante.** Si algo no está definido en la Constitución o en la jerarquía de fuentes que ésta establece, la respuesta correcta es:
   > "Información pendiente de definición."
   y detener únicamente esa parte de la implementación.
9. **No generar documentación adicional de arquitectura ni resúmenes del proyecto** — la fase actual es desarrollo, no análisis.
10. **Seguir el orden oficial de desarrollo** definido en la Sección 13 de la Constitución, módulo por módulo, esperando aprobación antes de avanzar a la siguiente fase.
