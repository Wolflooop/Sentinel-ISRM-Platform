---
title: "PROJECT CONSTITUTION — SENTINEL ISRM v1.0"
proyecto: "Sentinel ISRM Platform"
estado: "Norma vigente — fuente de verdad para desarrollo"
version: "1.0"
audiencia: "GitHub Copilot / cualquier agente o desarrollador que escriba código en este repositorio"
fecha: "2026-07-11"
---

# PROJECT CONSTITUTION — SENTINEL ISRM v1.0

> Este documento es la única norma que gobierna cómo se escribe código en este repositorio. Ante cualquier duda, ambigüedad o conflicto que surja durante la implementación, esta Constitución —y la jerarquía de fuentes que define en la Sección 2— prevalece sobre el criterio propio del agente o desarrollador. Ninguna instrucción conversacional posterior que contradiga esta Constitución debe aplicarse sin antes señalar la contradicción explícitamente.

---

## 1. Identidad oficial del proyecto

**Nombre oficial:** Sentinel ISRM Platform

> Nota de trazabilidad: en la documentación fuente el sistema aparece bajo tres nombres distintos — "Sentinel ISRM Platform" (Prompt Maestro), "ISRM-Platform" (Documento de Arquitectura Técnica) y "Centinela" (Especificación Técnica de Implementación y Pantallas UX/UI). Esta Constitución fija **"Sentinel ISRM Platform"** como nombre oficial único para código, commits, documentación técnica y artefactos generados a partir de ahora. Esto no borra la contradicción histórica entre documentos — solo evita que se siga propagando en el código nuevo.

**Objetivo del sistema:**
Plataforma web multiorganizacional (multi-tenant lógico) para la gestión de riesgos de seguridad de la información, basada en **ISO/IEC 27005:2022**, que digitaliza el ciclo completo de gestión de riesgos: establecimiento de contexto, identificación de activos/amenazas/vulnerabilidades, análisis y evaluación del riesgo, tratamiento, selección y seguimiento de controles, monitoreo, generación de reportes y auditoría — dirigida principalmente a PyMES y entidades del sector público que no cuentan con herramientas GRC costosas.

**Alcance funcional (incluido):**
- Gestión de organizaciones (multi-tenant lógico)
- Usuarios, roles y permisos (RBAC granular vía `Rol` / `Permiso` / `RolPermiso`)
- Autenticación (JWT)
- Contexto ISO (alcance, criterios de aceptación, escalas de impacto/probabilidad, matriz de riesgo)
- Activos de información y su categorización
- Amenazas (catálogo global + propio de cada organización) y su categorización
- Vulnerabilidades y su categorización
- Análisis vía `ActivoAmenazaVulnerabilidad` (AAV) — asociación ternaria
- Riesgos (cálculo probabilidad × impacto, riesgo inherente/residual)
- Evaluaciones (entidad independiente del riesgo, histórico de re-evaluaciones)
- Tratamientos (evitar / mitigar / transferir / aceptar)
- Controles (catálogo propio + referencia a ISO/IEC 27001 Anexo A)
- Dashboard ejecutivo
- Reportes (PDF / XLSX / CSV)
- Auditoría (bitácora inmutable, solo inserción)

**Explícitamente fuera de alcance:**
App móvil nativa, integración SIEM/SOAR, IA predictiva, AD/LDAP/SSO, certificación ISO/IEC 27001 formal, multi-idioma, notificaciones por correo/push, escaneo automático de vulnerabilidades (el módulo de vulnerabilidades es un registro manual/curado, no un scanner).

---

## 2. Jerarquía de fuentes de verdad

Ante cualquier conflicto entre documentos, se resuelve **siempre** a favor del documento de mayor jerarquía. Ningún agente debe resolver una contradicción "usando su propio criterio" — debe reportarla y detener esa parte de la implementación (ver Sección 3 y Sección 10).

| Prioridad | Fuente | Rol |
|---|---|---|
| 1 (más alta) | **`schema.prisma`** | Estructura física única de verdad: modelos, campos, enums, relaciones, claves. Ninguna otra fuente puede contradecirlo en materia de estructura de datos. |
| 2 | **Especificación Técnica de Implementación** | Resoluciones formales de alcance (p. ej. exclusión explícita de entidades), reglas de negocio a nivel de aplicación, mecanismos de seguridad. |
| 3 | **Documento de Arquitectura ISRM / ISO 27005** | Arquitectura conceptual y de dominio ISO/IEC 27005. **Advertencia:** este documento contiene entidades y mecanismos que ya NO existen en `schema.prisma` (ver Sección 3.3) — donde haya conflicto con `schema.prisma`, este último gana. |
| 4 | **Modelo de datos, Fases 2 a 7** (atributos, claves, relaciones, integridad, normalización, diagrama ER) | Documenta el razonamiento detrás de `schema.prisma`; útil para entender el *porqué*, pero no sustituye a `schema.prisma` si hay discrepancia textual. |
| 5 | **Backlog / Sprint Planning** | Define el orden de entrega priorizado, pero es un artefacto de alcance más reducido y temprano que el modelo de datos final — no elimina módulos definidos en fuentes superiores. |
| 6 (más baja) | **Pantallas UX/UI aprobadas** | Referencia de interfaz. Donde una pantalla implique un tipo de dato o rango distinto al de `schema.prisma` (p. ej. porcentajes vs. escala 1–5), prevalece `schema.prisma` y la pantalla se ajusta, no al revés. |

---

## 3. Restricciones absolutas

Estas reglas no admiten excepción sin autorización explícita y por escrito del responsable del proyecto (Silver).

### 3.1 Sobre el modelo de datos
- **No crear entidades, tablas, campos, enums o relaciones nuevas** que no existan ya en `schema.prisma`.
- **No modificar `schema.prisma`** (tipos, relaciones, restricciones, `onDelete`, índices) sin autorización explícita.
- No inventar reglas de negocio, endpoints o tecnologías no documentadas.

### 3.2 Entidades explícitamente prohibidas

Las siguientes entidades **no deben crearse bajo ningún nombre, forma equivalente o disfraz de campo compuesto**, incluso si aparecen mencionadas como vigentes en el Documento de Arquitectura ISRM/ISO27005:

- `Configuracion`
- `RefreshToken`
- `Evidencia`
- `SnapshotRiesgo`
- `TratamientoControl`

Esta prohibición ya fue resuelta formalmente por la Especificación Técnica de Implementación (Resolución A: prevalece `schema.prisma`), y esta Constitución la ratifica como restricción absoluta.

### 3.3 Contradicciones ya detectadas que NO deben "corregirse" por criterio propio

El agente debe tratar los siguientes puntos como **información pendiente de definición** y no resolverlos inventando una solución:

- Nombre del sistema (ver Sección 1).
- Relación `Tratamiento` ↔ `Control`: Arquitectura describe N:M vía `TratamientoControl`; `schema.prisma` implementa 1:N simple vía `Tratamiento.controlPrincipalId`. **Prevalece `schema.prisma`.**
- Mecanismo de sesión: Arquitectura describe access token + refresh token vía `RefreshToken`; `schema.prisma` solo tiene `Sesion.tokenHash`, sin mecanismo explícito de rotación. No implementar refresh tokens hasta que se resuelva.
- Escala de probabilidad/impacto: Pantallas UX/UI mencionan "0–100%"; `schema.prisma` usa enteros 1–5 (`Riesgo.probabilidad`, `Riesgo.impacto`). **Prevalece `schema.prisma`**; el frontend debe adaptarse a la escala 1–5.
- Niveles de riesgo: Backlog menciona 3 niveles; `schema.prisma` define `enum NivelRiesgo` con 4 valores (`BAJO`, `MEDIO`, `ALTO`, `CRITICO`). **Prevalece `schema.prisma`.**
- Catálogo de roles: Arquitectura enumera 6 roles predefinidos; Backlog menciona solo 2. La matriz completa de roles/permisos está **pendiente de definición** — no inventar los 4 roles faltantes ni sus permisos.
- Campo `origen` en `Vulnerabilidad` (Técnica/Organizativa/Física): mencionado en Arquitectura, **no existe** en `schema.prisma`. No agregarlo.
- Módulo de Configuración y Módulo de Monitoreo (dependiente de un campo `Riesgo.proximaRevision` inexistente): sin entidad ni campo de soporte en `schema.prisma`. No implementar hasta definición.
- Recuperación de contraseña (`/auth/forgot-password`, `/auth/reset-password`): sin entidad, campo, ni proveedor de correo aprobado. No implementar hasta definición.
- Referencia a una "Constitución del Proyecto (Capítulos 1–32)" citada en la Especificación Técnica pero no proporcionada como documento: su contenido no puede verificarse y no debe inventarse. Esta Constitución (v1.0) es, a partir de ahora, el documento normativo vigente para efectos de desarrollo.

> **Resuelto por esta Constitución:** el uso de TypeScript, mencionado únicamente en el Prompt Maestro y ausente del resto del stack documentado, deja de estar pendiente de definición — ver Sección 14.

---

## 4. Arquitectura Backend obligatoria

Toda petición HTTP debe atravesar exactamente esta cadena de capas, sin omisiones ni atajos:

```
Route
 ↓
JWT Authentication Middleware
 ↓
RBAC Middleware
 ↓
Zod Validation Middleware
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

**Controllers**
- Solo manejan HTTP (request/response, status codes).
- NO contienen lógica de negocio.
- NO usan Prisma directamente.
- NO validan reglas ISO/IEC 27005.

**Services**
- Contienen la lógica de negocio y las reglas ISO/IEC 27005 (cálculos de riesgo, validaciones funcionales, transiciones de estado).
- NO importan Express ni acceden a `req`/`res`.
- NO acceden a Prisma directamente.

**Repositories**
- Única capa autorizada para usar Prisma Client, ejecutar consultas y persistir datos.
- NO contienen reglas de negocio.

**DTO y Mapper (obligatorio)**
```
Prisma Model → Mapper → DTO → Controller Response
```
- Ningún controller devuelve un objeto Prisma crudo.
- Nunca se expone `passwordHash` ni ningún otro dato sensible interno.

---

## 5. Arquitectura Frontend

**Stack obligatorio:** React + Vite, Tailwind CSS, React Router DOM, Axios, React Hook Form, Zod, TanStack Query, Chart.js, Lucide React.

**Organización de carpetas:**
```
src/
 ├── features/
 │     └── <modulo>/
 │           ├── components/
 │           ├── hooks/
 │           ├── services/
 │           ├── schemas/
 │           ├── pages/
 │           └── types/
 ├── components/
 ├── layouts/
 └── routes/
```

- TanStack Query gestiona todo el estado de servidor (fetch, cache, invalidación).
- React Hook Form + Zod gestionan formularios y su validación.
- Los componentes de feature no contienen lógica de red directa: toda llamada HTTP vive en `services/`.

---

## 6. Modelo de datos aprobado

**Fuente física única de verdad:** `schema.prisma`. A continuación, el inventario que debe usarse como referencia — no se documentan aquí las entidades descartadas en la Sección 3.2, aunque aparezcan en otros documentos.

**23 modelos (22 entidades de negocio + 1 entidad puente técnica):**

| Bloque | Entidades |
|---|---|
| Administración | `Organizacion`, `Usuario`, `Rol`, `Permiso`, `RolPermiso` (puente técnico), `Sesion`, `Auditoria` |
| Contexto ISO | `Contexto`, `EscalaImpacto`, `EscalaProbabilidad`, `MatrizRiesgo` |
| Inventario / Amenazas / Vulnerabilidades | `CategoriaActivo`, `Activo`, `CategoriaAmenaza`, `Amenaza`, `CategoriaVulnerabilidad`, `Vulnerabilidad` |
| Análisis | `ActivoAmenazaVulnerabilidad` (AAV), `Riesgo`, `Evaluacion` |
| Tratamiento | `Tratamiento`, `Control` |
| Reportes | `Reporte` |

**Enumeraciones definidas en `schema.prisma`:** `Sector`, `TamanoOrganizacion`, `EstadoOrganizacion`, `FormatoReporte`, `AccionAuditoria`, `NivelRiesgo` (4 valores: `BAJO`, `MEDIO`, `ALTO`, `CRITICO`), `EstadoActivo`, `OrigenAmenaza`, `EstadoRiesgo`, `ResultadoEvaluacion`, `EstrategiaTratamiento`, `EstadoTratamiento`, `TipoControl`, `EstadoImplementacionControl`, `TipoReporte`.

**Decisión de aislamiento multi-tenant (Fase 8.1, ratificada aquí):** `Riesgo`, `Evaluacion` y `Tratamiento` **no** almacenan `organizacionId` directo; el aislamiento se resuelve vía JOIN (`Riesgo → AAV → Activo → Organizacion`). `Activo`, `Auditoria` y `Reporte` **sí** almacenan `organizacionId` directo. Ningún agente debe "corregir" esta asimetría agregando `organizacionId` a `Riesgo`/`Evaluacion`/`Tratamiento` sin autorización — es una decisión de diseño ya tomada, no un defecto.

**Restricciones de dominio no expresables en Prisma (requieren migración SQL `CHECK` manual):**
- `Activo.criticidad`, `Riesgo.probabilidad`, `Riesgo.impacto`, `Vulnerabilidad.severidad`: rango 1–5.
- `Riesgo.valorRiesgo`: rango 1–25, calculado y sincronizado por la capa de Services (no por trigger de base de datos).
- `Tratamiento.porcentajeAvance`: rango 0–100.

---

## 7. Relaciones principales del modelo de datos

- **30 relaciones**, mayoritariamente 1:N.
- **1:1:** `AAV` ↔ `Riesgo` (única, `Riesgo.aavId` es `@unique`).
- **1:0..1:** `Evaluacion` ↔ `Tratamiento` (solo cuando `resultado = NO_ACEPTABLE`).
- **N:M vía entidad puente:** `Rol` ↔ `Permiso` (vía `RolPermiso`).
- **Ternaria vía entidad puente:** `Activo` + `Amenaza` + `Vulnerabilidad` (vía `AAV`).
- **1:N con FK opcional (catálogo global):** `Organizacion → Amenaza`, `Organizacion → Control` (`organizacionId` nulo = catálogo global).
- **Regla de eliminación por defecto:** restringir antes que cascada. De las 30 relaciones, 26 son `Restrict` y solo 4 son `Cascade` (`Usuario → Sesion`, y las tres entidades de configuración metodológica de `Contexto`: `EscalaImpacto`, `EscalaProbabilidad`, `MatrizRiesgo`).
- **Excepciones de normalización ya aprobadas (no son defectos a corregir):**
  - 1FN: `Auditoria.datosAnteriores` / `Auditoria.datosNuevos` (estructura serializada, mapeada a JSONB).
  - 3FN: `organizacionId` redundante en `Auditoria` y `Reporte` (aislamiento multi-tenant por diseño); `Riesgo.valorRiesgo`, `Riesgo.nivelRiesgoInherente`, `Riesgo.nivelRiesgoResidual` (atributos calculados y persistidos por rendimiento).

---

## 8. Módulos funcionales que deben implementarse

1. Autenticación
2. Usuarios, roles y permisos
3. Organizaciones
4. Contexto ISO
5. Activos
6. Amenazas
7. Vulnerabilidades
8. AAV y Riesgos
9. Evaluaciones
10. Tratamientos
11. Controles
12. Dashboard
13. Reportes
14. Auditoría

---

## 9. Seguridad obligatoria

- **Autenticación:** JWT + bcrypt para contraseñas; nunca almacenar contraseñas en texto plano; sesiones gestionadas mediante el modelo `Sesion` ya definido en `schema.prisma`.
- **Autorización (RBAC):** exclusivamente vía `Rol` / `Permiso` / `RolPermiso`. **Prohibido** cualquier validación hardcodeada por nombre de rol (p. ej. `if (usuario.esAdministrador)`).
- **Multi-tenant:** toda consulta debe aislarse por `organizacionId`, ya sea de forma directa o mediante la relación definida en `schema.prisma` (ver Sección 6). Nunca permitir acceso entre organizaciones.
- **Validación de entrada:** Zod en todos los endpoints, antes de llegar al Controller.
- **Cabeceras y límites:** Helmet y `express-rate-limit` activos globalmente.
- **Registro:** Winston (logs de aplicación) y Morgan (logs HTTP).
- **Auditoría:** toda acción crítica sobre entidades sensibles debe registrar un evento en `Auditoria`; esta tabla es de solo inserción — ningún registro de auditoría se edita o elimina bajo ninguna circunstancia.

---

## 10. Reglas ISO/IEC 27005 aplicables al desarrollo

Toda lógica relacionada con la gestión de riesgo implementada en la capa de Services debe respetar el flujo metodológico de ISO/IEC 27005, reflejado en el modelo de datos:

```
Contexto → Activos → Amenazas / Vulnerabilidades → AAV → Riesgo → Evaluación → Tratamiento → Controles
```

En particular:
- No puede crearse una `Evaluacion` si la organización no tiene un `Contexto` con `activo = true`.
- Un `Riesgo` nace exclusivamente de una combinación `AAV` (Activo + Amenaza + Vulnerabilidad); no puede existir un riesgo huérfano.
- Solo las evaluaciones con `resultado = NO_ACEPTABLE` pueden derivar en un `Tratamiento`.
- `Tratamiento.controlPrincipalId` es obligatorio a nivel de aplicación únicamente cuando `estrategia = MITIGAR`.
- Los cálculos de `valorRiesgo` y `nivelRiesgoInherente` deben recalcularse y persistirse en la misma operación en que cambian `probabilidad` o `impacto`, exclusivamente desde la capa de Services.

---

## 11. Convenciones de código

**Backend**
```
src/
 ├── modules/
 │    └── <dominio>/
 │          ├── routes/
 │          ├── controller/
 │          ├── service/
 │          ├── repository/
 │          ├── schema/
 │          ├── dto/
 │          ├── mapper/
 │          └── types/
 ├── middleware/
 ├── config/
 └── shared/
```

**Frontend**
```
src/
 ├── features/
 │     └── <modulo>/
 │           ├── components/
 │           ├── hooks/
 │           ├── services/
 │           ├── schemas/
 │           ├── pages/
 │           └── types/
 ├── components/
 ├── layouts/
 └── routes/
```

---

## 12. Reglas para GitHub Copilot (y cualquier agente que escriba código en este repositorio)

1. **Leer primero esta Constitución** antes de generar o modificar cualquier archivo de código.
2. **No asumir información faltante.** Si algo no está definido en la jerarquía de fuentes (Sección 2), la respuesta correcta es: *"Información pendiente de definición"*, deteniendo esa parte de la implementación.
3. **Preguntar antes de implementar algo ambiguo** — nunca resolver una contradicción documental (Sección 3.3) por criterio propio.
4. **No generar código fuera del alcance** definido en la Sección 1, ni entidades/campos fuera de los definidos en `schema.prisma` (Sección 6).
5. **No modificar `schema.prisma`** sin autorización explícita.
6. Respetar en todo momento la separación de capas de la Sección 4 (Controller / Service / Repository) y el flujo DTO/Mapper.
7. Ante cualquier necesidad de una entidad de la lista prohibida (Sección 3.2), detenerse y reportar, nunca crear un sustituto encubierto.

---

## 13. Orden oficial de desarrollo

| Fase | Módulo |
|---|---|
| 1 | Infraestructura base |
| 2 | Autenticación |
| 3 | Usuarios, roles y permisos |
| 4 | Organizaciones |
| 5 | Contexto ISO |
| 6 | Activos |
| 7 | Amenazas |
| 8 | Vulnerabilidades |
| 9 | AAV y Riesgos |
| 10 | Evaluaciones |
| 11 | Tratamientos |
| 12 | Controles |
| 13 | Dashboard |
| 14 | Reportes |
| 15 | Auditoría |

Cada fase se implementa únicamente después de:
1. revisar la documentación aplicable según la jerarquía de la Sección 2;
2. indicar los archivos y entidades involucradas;
3. esperar aprobación explícita antes de escribir código.

---

## 14. Decisión tecnológica — Lenguaje

El proyecto utilizará **TypeScript** como lenguaje principal tanto para Frontend como Backend.

### Justificación

- Mayor seguridad mediante tipado estático.
- Mejor mantenibilidad y escalabilidad del código.
- Mejor integración con Prisma ORM, React y herramientas modernas del ecosistema.
- Reducción de errores durante el desarrollo.

### Regla de implementación

Todos los archivos nuevos deberán utilizar TypeScript:

**Frontend**
- Componentes React: `.tsx`
- Lógica, hooks, servicios y utilidades: `.ts`

**Backend**
- Todos los archivos de aplicación: `.ts`

No se permitirá JavaScript puro (`.js` / `.jsx`) salvo archivos de configuración donde una herramienta específica lo requiera.

---

## 15. Gestión de cambios de base de datos

Toda modificación del modelo de datos deberá realizarse exclusivamente mediante Prisma.

**Desarrollo**
```bash
prisma migrate dev
```

**Producción**
```bash
prisma migrate deploy
```

**Reglas:**
- Nunca modificar tablas directamente en PostgreSQL.
- Nunca ejecutar cambios manuales fuera del sistema de migraciones de Prisma.
- Todo cambio deberá quedar registrado mediante una migración versionada.

---

## 16. Control de versiones

El proyecto utilizará Git como sistema de control de versiones.

### Ramas principales

**`main`**
- Contiene únicamente versiones estables aprobadas.
- Rama protegida.

**`develop`**
- Rama de integración de funcionalidades.
- Base para pruebas antes de liberar a producción.
- Rama protegida.

### Ramas de trabajo

**`feature/<modulo>-<descripcion>`**
- Desarrollo de nuevas funcionalidades.

**`fix/<descripcion>`**
- Corrección de errores.

### Convención de commits

El proyecto utilizará Conventional Commits:

- `feat:` nueva funcionalidad
- `fix:` corrección de errores
- `refactor:` modificación interna sin cambiar comportamiento
- `docs:` cambios de documentación
- `test:` creación o modificación de pruebas
- `chore:` tareas de mantenimiento

---

## 17. Estado del documento

Este documento se considera vigente desde su aprobación.

Toda implementación, modificación o generación de código dentro del proyecto deberá cumplir obligatoriamente las reglas establecidas en esta Constitución.

---

## Cierre

Esta Constitución no agrega entidades, campos, relaciones ni reglas de negocio nuevas: consolida y ratifica lo ya aprobado en las Fases 1 a 8 del modelo de datos y en la documentación de arquitectura, resolviendo únicamente la prioridad entre fuentes cuando existe conflicto, y fijando el nombre oficial del sistema. Ninguna contradicción documental listada en la Sección 3.3 queda "resuelta" por este documento — permanecen como información pendiente de definición hasta que Silver las resuelva explícitamente.

Quedo a la espera de tu validación de esta Constitución antes de iniciar la **Fase 1 — Infraestructura base**.
