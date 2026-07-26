# Base de Datos — Sentinel ISRM

## 1. Motor y ORM

- **Motor**: PostgreSQL (`datasource db { provider = "postgresql" }`).
- **ORM**: Prisma 5 (`@prisma/client` / `prisma`), esquema declarado en
  `apps/backend/prisma/schema.prisma` (~1060 líneas).
- **Cliente**: `src/config/prisma.ts` expone la instancia única de
  `PrismaClient` consumida por todos los repositories.
- **Migraciones**: gestionadas con `prisma migrate` (`prisma/migrations/`),
  historial actual: `20260715030000_baseline`,
  `20260715035125_add_evento_seguridad`,
  `20260717120000_multitenant_rbac_hierarchy`,
  `20260718090000_riesgo_control_historial`, `20260719071300_`,
  `20260721000000_v2_riesgo_evaluacion_tratamiento_polimorficos`.
- **Seed**: `prisma/seed.ts`, idempotente, siembra únicamente datos
  globales del sistema (roles, catálogo de permisos, `RolPermiso`,
  categorías globales, catálogos ISO predefinidos, la organización técnica
  `__SISTEMA__` y el usuario `SUPER_ADMIN` inicial). Nunca crea
  organizaciones de negocio, usuarios de organización, ni datos
  operativos — esos se crean desde la aplicación.
- **Restricciones no expresables en Prisma**: el propio schema documenta,
  mediante comentarios, varias restricciones `CHECK` y un índice único
  parcial que Prisma no puede declarar de forma nativa y que se
  implementan mediante SQL personalizado dentro de las migraciones (rangos
  de dominio 1–5 en escalas/criticidad/severidad, rango 0–100 en
  porcentaje de avance, exclusividad del destino polimórfico en
  Comentario/Seguimiento/Evidencia, condición de origen `AAV`/`MANUAL` en
  Riesgo, y el índice único parcial `contexto_organizacion_activo_unique`
  que garantiza como máximo un `Contexto` activo por organización).

## 2. Modelos principales

El schema se organiza en 7 bloques temáticos:

### 2.1 Administración

- **Organizacion**: tenant de la plataforma (`nombre` único, `sector`,
  `tamano`, `paisIso`, `estado`, configuración de reportes/alertas).
- **Usuario**: pertenece a una `Organizacion` (nullable — `null` solo para
  el `SUPER_ADMIN` global) y a un `Rol`; `email` único global; contraseña
  hasheada; control de intentos fallidos y bloqueo temporal.
- **Rol**: catálogo de roles, con `tipo` (`TipoRol`: `SUPER_ADMIN` /
  `ADMIN_TIC` / `USUARIO_COMUN`) que determina la jerarquía real,
  independiente del `nombre` visible.
- **Permiso**: catálogo de permisos (`recurso` + `accion`, único).
- **RolPermiso**: tabla puente N:M entre `Rol` y `Permiso`.
- **Sesion**: sesión activa asociada a un `Usuario`, identificada por el
  hash SHA-256 del JWT (`tokenHash`, único), con `expiraEn` y `revocado`.
- **Auditoria**: registro de solo inserción de operaciones CRUD sobre
  entidades de negocio (`usuarioId`, `organizacionId`, `entidad`,
  `entidadId`, `accion`, `datosAnteriores`/`datosNuevos` en JSON,
  `direccionIp`).

### 2.2 Contexto ISO

- **Contexto**: alcance y criterios de aceptación de riesgo de una
  organización; solo uno puede estar `activo = true` por organización
  (índice único parcial).
- **EscalaImpacto** / **EscalaProbabilidad**: niveles 1–5 con etiqueta y
  descripción, asociados a un `Contexto`.
- **MatrizRiesgo**: combinación `(nivelProbabilidad, nivelImpacto) →
  nivelResultante` (`NivelRiesgo`: `BAJO`/`MEDIO`/`ALTO`/`CRITICO`).

### 2.3 Inventario, amenazas, vulnerabilidades

- **CategoriaActivo** / **CategoriaAmenaza** / **CategoriaVulnerabilidad**:
  catálogos globales.
- **Activo**: bien a proteger; pertenece a una `Organizacion` y a un
  `usuarioResponsable`; `criticidad` (1–5); `estado`
  (`ACTIVO`/`INACTIVO`/`RETIRADO`).
- **Amenaza**: `organizacionId` nullable (`null` = catálogo global
  administrado por el sistema, `esPredefinida = true`); `origen`
  (`INTERNO`/`EXTERNO`).
- **Vulnerabilidad**: mismo patrón nullable que `Amenaza`; `severidad`
  (1–5); `referenciaCVE` opcional.

### 2.4 Análisis (AAV, Riesgo, Evaluación)

- **ActivoAmenazaVulnerabilidad (AAV)**: puente ternario
  `Activo + Amenaza + Vulnerabilidad`, único por combinación. Representa
  un escenario concreto de riesgo; no tiene CRUD ni pantalla propia — se
  crea implícitamente al identificar un `Riesgo` de origen `AAV`.
- **CategoriaIdentificacionRiesgo**: catálogo para riesgos de origen
  `MANUAL` (sin AAV).
- **Riesgo**: entidad central del análisis. `origen` (`AAV`/`MANUAL`)
  determina qué campos son obligatorios (CHECK a nivel de base de datos):
  origen `AAV` exige `aavId`; origen `MANUAL` exige `titulo` y
  `categoriaIdentificacionId`. No almacena su propio nivel de riesgo: eso
  vive siempre en la `Evaluacion` vigente (`evaluacionActualId`). Tiene
  `creadorId` (fijo) y `responsableId` (reasignable solo por `ADMIN_TIC`),
  y `estado` (`EstadoRiesgo`: `IDENTIFICADO` → `EN_ANALISIS` →
  `EVALUADO` → `TRATADO` → `CERRADO` / `MONITOREADO` / `ACEPTADO` /
  `REABIERTO`).
- **RiesgoHistorial**: traza cada cambio de `Riesgo.estado`, siempre
  escrita dentro de la misma transacción que produce el cambio.
- **Evaluacion**: calcula `probabilidad × impacto = valorCalculado →
  nivelRiesgo`, contra la `MatrizRiesgo` del `Contexto` vigente.
  `tipoEvaluacion` distingue `INHERENTE` (antes de tratar el riesgo) de
  `RESIDUAL` (después). Un `Riesgo` puede acumular múltiples evaluaciones
  a lo largo del tiempo.
- **ResolucionRiesgo**: historial 1:N de eventos `RESOLUCION` /
  `REAPERTURA` de un riesgo (un riesgo puede resolverse, reabrirse y
  volver a resolverse).
- **Comentario / Seguimiento / Evidencia**: entidades polimórficas —
  pertenecen a exactamente uno de `Riesgo`/`Evaluacion`/`Tratamiento`/
  `Control` (Comentario) o `Riesgo`/`Tratamiento`/`Control` (Seguimiento y
  Evidencia, sin `Evaluacion`). La exclusividad se garantiza mediante
  `CHECK` en la migración; a nivel de aplicación el DTO de creación exige
  exactamente un `*Id` no nulo.

### 2.5 Tratamiento

- **Tratamiento**: la respuesta a una evaluación `NO_ACEPTABLE`;
  `estrategia` (`EVITAR`/`MITIGAR`/`TRANSFERIR`/`ACEPTAR`), `estado`
  (`PROPUESTO`/`EN_EJECUCION`/`COMPLETADO`/`VENCIDO`), `porcentajeAvance`
  (0–100), campos de gobernanza (`aprobadoPorId`, `fechaAprobacion`,
  `fechaLimite`). Depende de `Riesgo` (no de `Evaluacion`, que queda solo
  como referencia histórica vía `evaluacionOrigenId`).
- **TratamientoControl**: puente N:M entre `Tratamiento` y `Control`, con
  flag `esPrincipal`.
- **Control**: salvaguarda concreta (`TipoControl`:
  `PREVENTIVO`/`DETECTIVO`/`CORRECTIVO`); `organizacionId` nullable (`null`
  = catálogo global de referencia ISO/IEC 27001 Anexo A);
  `estadoImplementacion` (`NO_INICIADO` → `EN_PROGRESO` → `IMPLEMENTADO` →
  `VERIFICADO`); `fechaImplementacion` debe permanecer `NULL` mientras no
  esté `IMPLEMENTADO` (regla de negocio validada en la capa de
  aplicación).
- **ControlHistorial**: traza cambios de `estadoImplementacion`, misma
  lógica que `RiesgoHistorial`.

### 2.6 Reportes

- **Reporte**: reporte generado (`tipo`: `EJECUTIVO`/`TECNICO`/`GENERAL`;
  `formato`: `PDF`/`XLSX`/`CSV` — solo `PDF` implementado), con
  `rutaArchivo` y trazabilidad de quién y cuándo lo generó.

### 2.7 Seguridad (eventos de autenticación/sesión)

- **EventoSeguridad**: ciclo de vida de sesión/autenticación
  (`TipoEventoSeguridad`, `ResultadoEventoSeguridad`,
  `SeveridadEventoSeguridad`), deliberadamente separado de `Auditoria`
  (ver `SECURITY.md`, sección 7). `usuarioId`/`organizacionId` nullable
  con `onDelete: SetNull`, ya que debe poder registrarse aun sin una
  identidad resuelta.

## 3. Relaciones principales

| Relación | Cardinalidad | Notas |
|---|---|---|
| Organización — Usuario | 1:N | Nullable en `Usuario` solo para `SUPER_ADMIN` |
| Usuario — Rol | N:1 | `Rol.tipo` determina la jerarquía |
| Rol — Permiso | N:M | Vía `RolPermiso` |
| Usuario — Sesion | 1:N | Historial de sesiones por usuario |
| Organización — Activo | 1:N | |
| Activo — Amenaza — Vulnerabilidad | N:M:N | Resuelto vía el puente ternario `ActivoAmenazaVulnerabilidad` |
| ActivoAmenazaVulnerabilidad — Riesgo | 1:1 opcional | Solo cuando `Riesgo.origen = AAV` |
| Riesgo — Evaluación | 1:N | Con puntero `evaluacionActualId` a la vigente |
| Riesgo — Tratamiento | 1:N | Un riesgo puede tener varios tratamientos en el tiempo |
| Tratamiento — Control | N:M | Vía el puente `TratamientoControl` |
| Riesgo — ResolucionRiesgo | 1:N | Historial de resoluciones/reaperturas |
| Riesgo / Evaluación / Tratamiento / Control — Comentario | 1:N polimórfico | Exactamente un destino por comentario |
| Riesgo / Tratamiento / Control — Seguimiento | 1:N polimórfico | Exactamente un destino por seguimiento |
| Riesgo / Tratamiento / Control — Evidencia | 1:N polimórfico | Exactamente un destino por evidencia |
| Organización — Auditoria | 1:N | Incluye acciones de `SUPER_ADMIN` resueltas hacia `__SISTEMA__` |
| Organización — Reporte | 1:N | |
| Organización — EventoSeguridad | 1:N (nullable) | Sobrevive a la eliminación de la organización (`SetNull`) |

## 4. Índices relevantes

Además de las claves foráneas, el schema define índices explícitos para
consultas frecuentes: `Usuario` por `rolId`/`organizacionId`/
`(organizacionId, activo)`; `Rol` por `tipo`; `Activo` por `categoriaId`/
`criticidad`; `Amenaza`/`Vulnerabilidad` por `esPredefinida`; `Riesgo` por
`estado`/`origen`/`creadorId`/`responsableId`/`creadoEn`;
`RiesgoHistorial`/`ControlHistorial` por `(entidadId, createdAt)`;
`Evaluacion` por `(riesgoId, fechaEvaluacion)`/`tipoEvaluacion`/
`contextoId`; `Tratamiento` por `riesgoId`/`estado`/`fechaLimite`;
`Control` por `codigoIso27001`/`estadoImplementacion`/`responsableId`;
`EventoSeguridad` por `usuarioId`/`organizacionId`/`evento`/`fecha`/
`severidad`/`(evento, fecha)` compuesto.

## 5. Estrategia de aislamiento multi-tenant a nivel de datos

Ver `ARCHITECTURE.md` (sección 5) y `SECURITY.md` (sección 5): algunos
modelos llevan `organizacionId` directo; los modelos de análisis de riesgo
(`Riesgo`, `Evaluacion`, `Tratamiento`) lo resuelven indirectamente vía
JOIN a través de `Activo` (origen AAV) o del `creador` (origen MANUAL), una
decisión explícita documentada en el propio `schema.prisma` (Fase 8.1) para
no duplicar la columna en cada entidad derivada.
