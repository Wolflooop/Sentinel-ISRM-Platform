# Seguridad — Sentinel ISRM

Este documento describe los mecanismos de seguridad implementados
efectivamente en el backend de Sentinel ISRM: autenticación, sesiones,
control de acceso, multi-tenancy, auditoría, y endurecimiento HTTP.

## 1. Autenticación con JWT

- La autenticación se realiza contra `POST /api/auth/login` con `email` +
  `password` (validados con Zod en `auth.schema.ts`).
- Al validar credenciales, el backend firma un **JSON Web Token** (librería
  `jsonwebtoken`, algoritmo `HS256`) con el payload:

  ```ts
  {
    sub: string;              // Usuario.id
    organizacionId: string | null; // null solo para SUPER_ADMIN
    rolId: string;
    tipoRol: "SUPER_ADMIN" | "ADMIN_TIC" | "USUARIO_COMUN";
  }
  ```

- El token se firma con el secreto `JWT_SECRET` (variable de entorno
  obligatoria) y expira según `JWT_EXPIRES_IN` (por defecto `1h`).
- La verificación (`verifyAuthToken`) exige explícitamente el algoritmo
  `HS256`, evitando ataques de confusión de algoritmo.
- El token se envía en cada petición autenticada como
  `Authorization: Bearer <token>`.
- Todas las decisiones de jerarquía de rol (`tipoRol`) se leen siempre del
  JWT ya verificado — nunca del body de la petición ni de ningún valor
  enviado por el cliente.

## 2. Manejo de sesiones

Sentinel ISRM combina JWT (stateless) con un registro de sesión en base de
datos (modelo `Sesion`), lo que permite revocar tokens antes de su
expiración natural:

- En cada login exitoso se crea una fila `Sesion` con:
  - `tokenHash`: SHA-256 del JWT emitido (nunca se almacena el token en
    claro).
  - `expiraEn`: calculado a partir de `JWT_EXPIRES_IN`.
  - `revocado`: `false` por defecto.
- El middleware `authenticate` no confía únicamente en la firma del JWT:
  además busca la `Sesion` activa asociada al hash del token y verifica
  que no esté revocada ni expirada en base de datos. Esto permite que un
  `logout` invalide el token de forma inmediata, algo que un JWT puro no
  permitiría hasta su expiración natural.
- `POST /api/auth/logout` marca la `Sesion` correspondiente como
  `revocado = true` (`revocarSesionPorTokenHash`).
- Cada rechazo de autenticación (token ausente, inválido, expirado, sesión
  revocada) queda registrado como `EventoSeguridad` (ver sección 8).

## 3. Hash de contraseñas

- Las contraseñas se almacenan exclusivamente como hash `bcrypt`
  (`shared/password.ts`), con **10 salt rounds**.
- Nunca se persiste ni se registra la contraseña en texto claro (tampoco en
  los registros de auditoría o eventos de seguridad).
- `comparePassword` usa la comparación segura de `bcrypt.compare`.

### 3.1 Política de bloqueo por intentos fallidos

- `Usuario.intentosFallidos` se incrementa en cada intento de login con
  contraseña incorrecta.
- Si `AUTH_MAX_INTENTOS_FALLIDOS` y `AUTH_BLOQUEO_MINUTOS` están definidos
  como variables de entorno, al alcanzar el máximo de intentos el usuario
  queda bloqueado temporalmente (`Usuario.bloqueadoHasta`), y el login
  responde `423 Locked` mientras dure el bloqueo.
- Un login exitoso resetea `intentosFallidos` a cero.

## 4. RBAC (Role-Based Access Control)

El control de acceso combina dos capas independientes, aplicadas siempre
juntas y nunca una en sustitución de la otra:

### 4.1 Permisos dinámicos por recurso/acción

- Catálogo de `Permiso` (`recurso`, `accion`) sembrado por `prisma/seed.ts`
  (p. ej. `activos:leer`, `riesgos:crear`, `roles:gestionarPermisos`).
- `Rol` se asocia a `Permiso` mediante la tabla puente `RolPermiso`.
- El middleware `authorize(recurso, accion)` consulta los permisos del
  `rolId` del token (`findPermisosPorRol`) y exige una coincidencia exacta
  de `{recurso, accion}`; de lo contrario responde `403`.
- El módulo **Roles** permite crear roles nuevos y asignar/quitar permisos
  dinámicamente (`POST /api/roles/:id/permisos`,
  `DELETE /api/roles/:id/permisos/:permisoId`), lo que habilita RBAC
  personalizado más allá de los tres roles predefinidos por el seed.

### 4.2 Jerarquía por tipo de rol

- Enum `TipoRol`: `SUPER_ADMIN` (Administrador Principal, global),
  `ADMIN_TIC` (administrador de una organización), `USUARIO_COMUN`
  (usuario operativo de una organización).
- El middleware `requireTipoRol(...tipos)` bloquea operaciones que dependen
  del nivel jerárquico y no de un permiso asignable dinámicamente: crear
  organizaciones, crear usuarios (`ADMIN_TIC`/`SUPER_ADMIN` únicamente,
  nunca `USUARIO_COMUN` aunque tuviera el permiso `usuarios:crear`
  asignado), acceder al dashboard global.
- Esta doble barrera se replica en el frontend (`RequiereTipoRol`,
  `RequierePermiso`) solo a efectos de UX; la autorización real y
  definitiva ocurre siempre en el backend.

### 4.3 Ownership (gestión por responsable)

Capa adicional aplicada en la capa de servicio (`shared/ownership.ts`),
posterior a `authorize`, para decidir si un usuario en particular puede
gestionar **un registro concreto**:

- `ADMIN_TIC` siempre puede gestionar cualquier registro de su
  organización.
- Un `USUARIO_COMUN` solo puede gestionar un registro si es su
  `responsableId` actual.
- Reasignar el responsable de un riesgo o tratamiento
  (`canReasignarRegistro`) está reservado exclusivamente a `ADMIN_TIC`,
  incluso para el responsable actual del registro.

## 5. Multi-tenancy

- Cada organización es un tenant aislado. La mayoría de los módulos
  operativos resuelven el `organizacionId` desde el JWT del usuario
  autenticado (nunca desde parámetros de la petición), y filtran/validan
  todas las consultas y mutaciones contra ese `organizacionId`.
- Los modelos de análisis de riesgo (`Riesgo`, `Evaluacion`, `Tratamiento`)
  no tienen `organizacionId` propio: su aislamiento se resuelve por JOIN
  a través de `Activo`/`creador` (ver `ARCHITECTURE.md`, sección 5).
- El `SUPER_ADMIN` es un usuario global (`organizacionId = null`) sin
  organización propia; los controllers de módulos operativos rechazan
  explícitamente sus peticiones con `400` si intenta invocarlos
  (`organizacionIdDe(req)` en cada controller lanza `AppError` si
  `req.user.organizacionId` es `null`).
- Catálogos como `Amenaza`, `Vulnerabilidad` y `Control` admiten registros
  globales (`organizacionId = null`, `esPredefinida = true`) administrados
  por el nivel de sistema, junto a registros propios de cada organización.

## 6. Auditoría

- Modelo `Auditoria`: tabla de solo inserción (sin `update`/`delete` desde
  la aplicación) que registra `usuarioId`, `organizacionId`, `entidad`,
  `entidadId`, `accion` (`CREAR` | `EDITAR` | `ELIMINAR` | `APROBAR`),
  `datosAnteriores`/`datosNuevos` (JSON) y `direccionIp`.
- Homologada mediante el helper compartido `shared/audit.ts`
  (`registrarAuditoria`), que **exige** recibir el mismo
  `Prisma.TransactionClient` de la transacción que ejecuta el cambio de
  negocio: el registro de auditoría nunca puede quedar separado (ni antes
  ni después) del cambio que audita — si la transacción hace rollback, el
  registro de auditoría también.
- Cuando el actor es un `SUPER_ADMIN` (sin organización propia),
  `resolverOrganizacionIdParaAuditoria` resuelve el `organizacionId` hacia
  la organización técnica `__SISTEMA__` (creada por el seed) para
  satisfacer la restricción `NOT NULL` de `Auditoria.organizacionId` sin
  asignarle una organización de negocio real.
- El módulo **Audit** expone `GET /api/auditoria` y
  `GET /api/auditoria/:id` (solo lectura) para consultar el rastro.

## 7. Eventos de seguridad

- Modelo `EventoSeguridad`, deliberadamente separado de `Auditoria`: registra
  el ciclo de vida de autenticación/sesión (`AUTH_LOGIN_SUCCESS`,
  `AUTH_LOGIN_FAILED`, `AUTH_LOGOUT`, `AUTH_SESSION_EXPIRED`,
  `AUTH_ACCESS_DENIED`), incluyendo eventos que ocurren **antes** de que
  exista una identidad confiable (p. ej. login fallido con un correo
  inexistente).
- Por eso, a diferencia de `Auditoria`, sus columnas `usuarioId` /
  `organizacionId` son nullable (`onDelete: SetNull`): el evento debe poder
  crearse sin identidad resuelta y sobrevivir aunque el usuario u
  organización se eliminen después (valor forense).
- Cada evento incluye `resultado` (`EXITO`/`FALLIDO`), `severidad`
  (`INFO`/`ADVERTENCIA`/`ALTA`/`CRITICA`), `direccionIp`, `descripcion` y
  un campo `detalles` (JSON) con contexto técnico adicional (ruta
  solicitada, motivo específico de rechazo, etc.).
- Se registran eventos en: intento sin token, token inválido/expirado,
  sesión revocada o inexistente, acceso denegado por RBAC o por jerarquía
  de rol, login fallido (correo inexistente, usuario inactivo, organización
  no activa, cuenta bloqueada, contraseña inválida), login exitoso y
  logout.
- El módulo **Security Events** expone `GET /api/eventos-seguridad` y
  `GET /api/eventos-seguridad/:id` (solo lectura, permiso
  `eventosSeguridad:leer`).

## 8. Helmet

- `app.use(helmet())` se aplica como primer middleware en `createApp()`,
  antes de cualquier otro middleware o ruta, aplicando las cabeceras HTTP de
  endurecimiento por defecto de Helmet (protección contra sniffing de
  MIME-type, `X-Frame-Options`, ocultamiento de `X-Powered-By`, política de
  referrer, entre otras).

## 9. Rate limiting

Implementado con `express-rate-limit` (`middleware/rateLimiters.ts`),
configurable y desactivable mediante `RATE_LIMIT_ENABLED`:

| Limiter | Uso | Configuración (env) |
|---|---|---|
| `apiLimiter` | Aplicado globalmente a todo `/api/*` en `app.ts`, antes de montar cualquier router | `API_RATE_LIMIT_WINDOW_MS`, `API_RATE_LIMIT_MAX_REQUESTS` |
| `authLimiter` | Aplicado adicionalmente solo sobre `POST /api/auth/login`, encima del `apiLimiter` general | `AUTH_RATE_LIMIT_WINDOW_MS`, `AUTH_RATE_LIMIT_MAX_REQUESTS` |
| `refreshLimiter` | Definido junto a los anteriores (límite = 5× el de `authLimiter`) | mismas variables que `authLimiter` |

Todos los limiters usan `standardHeaders: true` (cabeceras `RateLimit-*`) y
`legacyHeaders: false`.

## 10. CORS

- Configurado con el paquete `cors`, restringido a un único origen
  permitido: `CORS_ORIGIN` (variable de entorno, por defecto
  `http://localhost:5173`, el origen del frontend en desarrollo).
- `credentials: true` para permitir el envío de cabeceras de autorización
  en peticiones cross-origin desde el frontend.

## 11. Validación de entrada

- Todo `req.body`/`req.query` que llega a un controller se valida con un
  esquema **Zod** antes de tocar la capa de servicio. Los errores de
  validación son capturados globalmente por `errorHandler` y devueltos como
  `400` con el detalle por campo (`err.flatten().fieldErrors`).
- Restricciones de dominio que Prisma no expresa nativamente (rangos 1–5
  para probabilidad/impacto/criticidad/severidad, 0–100 para porcentaje de
  avance, condiciones `CHECK` sobre combinaciones de columnas) se
  documentan explícitamente en `schema.prisma` como pendientes de
  implementarse vía migración SQL personalizada — no dependen únicamente
  de la validación Zod de la capa de aplicación.

## 12. Manejo de errores

`middleware/errorHandler.ts` centraliza la respuesta de error para toda la
API:

- `ZodError` → `400` con `{ error, detalles: <errores por campo> }`.
- `AppError` (u otro error con `status`) → responde con ese `status` y el
  mensaje del error.
- Cualquier otro error no controlado → `500` con mensaje genérico
  `"Error interno del servidor"` (el `stack` solo se incluye cuando
  `NODE_ENV !== "production"`).
- Todo error se registra vía `winston` (`logger.error`) con `path`,
  `method` y el error original.
