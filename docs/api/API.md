# API — Sentinel ISRM

Documentación de referencia de la API REST expuesta por
`apps/backend`. Todos los endpoints (salvo `POST /api/auth/login` y
`GET /health`) requieren autenticación.

## 1. Convenciones generales

- **Base URL**: `<host>/api` (p. ej. `http://localhost:4000/api` en
  desarrollo; el frontend la consume desde `VITE_API_BASE_URL`).
- **Formato**: JSON en request y response (`Content-Type: application/json`),
  excepto la carga de evidencias (`multipart/form-data`) y la descarga de
  reportes/evidencias (binario, `application/pdf` u octet-stream).
- **Idioma**: nombres de recursos, rutas, campos y mensajes de error están en
  español (`activos`, `amenazas`, `riesgos`, `usuarios`, etc.), reflejando el
  dominio de negocio.
- **IDs**: todos los identificadores son UUID (`String @id @default(uuid())`
  en Prisma).
- **Paginación/filtros**: los endpoints de listado aceptan filtros como
  query params validados con Zod (ver ejemplos por módulo más abajo); no
  hay paginación por cursor/offset genérica implementada — los listados
  devuelven el conjunto completo filtrado.
- **Verbos HTTP**: `GET` (lectura), `POST` (creación / acciones), `PATCH`
  (actualización parcial), `PUT` (reemplazo, usado en Contexto ISO para
  escalas y matriz), `DELETE` (eliminación, solo en catálogos que lo
  permiten).

## 2. Autenticación

Todas las rutas protegidas exigen la cabecera:

```
Authorization: Bearer <token_jwt>
```

El token se obtiene en `POST /api/auth/login` y se invalida explícitamente
con `POST /api/auth/logout` (revocación de sesión en base de datos, además
de su expiración natural). Ver `SECURITY.md` para el detalle del mecanismo.

## 3. Headers

| Header | Requerido | Descripción |
|---|---|---|
| `Authorization: Bearer <token>` | Sí (excepto login/health) | JWT de sesión |
| `Content-Type: application/json` | Sí, en requests con body JSON | |
| `Content-Type: multipart/form-data` | Sí, en `POST /api/evidencias` | Carga de archivo (campo `archivo`) |

La API responde siempre `Content-Type: application/json`, salvo en las
rutas de descarga de archivo (`/reportes/:id/descargar`,
`/evidencias/:id/descargar`).

## 4. Respuestas estándar

### 4.1 Éxito

- `200 OK`: lectura o actualización exitosa.
- `201 Created`: creación exitosa; el cuerpo devuelve el recurso creado
  mapeado a su DTO de respuesta (`mapper/*.mapper.ts`).
- `204 No Content`: operación exitosa sin cuerpo de respuesta (p. ej.
  `POST /api/auth/logout`).

### 4.2 Error

Formato uniforme, generado por `middleware/errorHandler.ts`:

```jsonc
// Error de validación Zod (400)
{
  "error": "Error de validación",
  "detalles": { "campo": ["mensaje de error"] }
}

// Error de negocio (AppError) o error genérico
{
  "error": "Mensaje descriptivo",
  "stack": "..."   // solo si NODE_ENV !== "production"
}
```

Códigos de estado usados por la API:

| Código | Significado |
|---|---|
| `400` | Validación fallida (Zod) o violación de una regla de negocio simple |
| `401` | No autenticado: token ausente, inválido, expirado, o sesión revocada |
| `403` | Autenticado pero sin permiso (`authorize`) o sin jerarquía suficiente (`requireTipoRol`) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (p. ej. nombre duplicado, estado inválido para la transición solicitada) |
| `423` | Cuenta bloqueada temporalmente por intentos fallidos de login |
| `429` | Límite de tasa excedido (`rateLimiters`) |
| `500` | Error interno no controlado |
| `501` | Funcionalidad no implementada (p. ej. formato de reporte distinto de PDF) |

## 5. Módulos disponibles

| Prefijo | Módulo |
|---|---|
| `/api/auth` | Autenticación |
| `/api/usuarios` | Usuarios |
| `/api/roles` | Roles |
| `/api/permisos` | Permisos |
| `/api/organizaciones` | Organizaciones |
| `/api/dashboard` | Dashboard |
| `/api/contexto` | Contexto ISO |
| `/api/activos` | Activos |
| `/api/amenazas` | Amenazas |
| `/api/vulnerabilidades` | Vulnerabilidades |
| `/api/riesgos` | Riesgos |
| `/api/categorias-identificacion-riesgo` | Categorías de identificación de riesgo (origen MANUAL) |
| `/api/evaluaciones` | Evaluaciones |
| `/api/tratamientos` | Tratamientos |
| `/api/controles` | Controles |
| `/api/resoluciones-riesgo` | Resoluciones de riesgo |
| `/api/comentarios` | Comentarios |
| `/api/seguimientos` | Seguimientos |
| `/api/evidencias` | Evidencias |
| `/api/reportes` | Reportes |
| `/api/auditoria` | Auditoría |
| `/api/eventos-seguridad` | Eventos de seguridad |

## 6. Endpoints principales

Salvo indicación contraria, cada endpoint exige `authenticate` +
`authorize(recurso, accion)` como en `app.ts`/`routes/*.routes.ts`.

### 6.1 Auth — `/api/auth`

| Método | Ruta | Middleware adicional | Descripción |
|---|---|---|---|
| `POST` | `/login` | `authLimiter` (pública) | Login con `email` + `password`; devuelve token JWT y datos del usuario |
| `POST` | `/logout` | `authenticate` | Revoca la sesión asociada al token actual |
| `GET` | `/me` | `authenticate` | Perfil del usuario autenticado + sus permisos efectivos |

### 6.2 Usuarios — `/api/usuarios`

| Método | Ruta | Permiso | Nota |
|---|---|---|---|
| `GET` | `/` | `usuarios:leer` | Lista usuarios de la organización actual |
| `GET` | `/:id` | `usuarios:leer` | |
| `POST` | `/` | `usuarios:crear` | Además exige `requireTipoRol("SUPER_ADMIN", "ADMIN_TIC")` |
| `PATCH` | `/:id` | `usuarios:actualizar` | |
| `PATCH` | `/:id/estado` | `usuarios:cambiarEstado` | Activar/desactivar usuario |

### 6.3 Roles — `/api/roles`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/` | `roles:leer` |
| `GET` | `/:id` | `roles:leer` |
| `GET` | `/:id/permisos` | `roles:leer` |
| `POST` | `/` | `roles:crear` |
| `PATCH` | `/:id` | `roles:actualizar` |
| `POST` | `/:id/permisos` | `roles:gestionarPermisos` |
| `DELETE` | `/:id/permisos/:permisoId` | `roles:gestionarPermisos` |

### 6.4 Permisos — `/api/permisos`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/` | `permisos:leer` — catálogo global de permisos |

### 6.5 Organizaciones — `/api/organizaciones`

| Método | Ruta | Middleware | Descripción |
|---|---|---|---|
| `GET` | `/` | `requireTipoRol("SUPER_ADMIN")` + `organizaciones:leer` | Lista todas las organizaciones (administración global) |
| `POST` | `/` | `requireTipoRol("SUPER_ADMIN")` + `organizaciones:crear` | Crea una nueva organización |
| `GET` | `/actual` | `organizaciones:leer` | Datos de la organización del usuario autenticado |
| `PATCH` | `/actual` | `organizaciones:actualizar` | Autogestión de la propia organización |
| `PATCH` | `/actual/estado` | `organizaciones:cambiarEstado` | Activar/suspender/desactivar la propia organización |

### 6.6 Dashboard — `/api/dashboard`

| Método | Ruta | Middleware | Descripción |
|---|---|---|---|
| `GET` | `/global` | `requireTipoRol("SUPER_ADMIN")` + `dashboard:leer` | Indicadores globales de la plataforma |

### 6.7 Contexto ISO — `/api/contexto`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/activo` | `contexto:leer` | Contexto ISO activo de la organización |
| `GET` | `/` | `contexto:leer` | Lista contextos |
| `GET` | `/:id` | `contexto:leer` | |
| `POST` | `/` | `contexto:crear` | Crea un Contexto ISO (alcance + criterios de aceptación) |
| `PATCH` | `/:id` | `contexto:actualizar` | |
| `PUT` | `/:id/escalas-impacto` | `contexto:actualizar` | Reemplaza la escala de impacto (niveles 1–5) |
| `PUT` | `/:id/escalas-probabilidad` | `contexto:actualizar` | Reemplaza la escala de probabilidad (niveles 1–5) |
| `PUT` | `/:id/matriz` | `contexto:actualizar` | Reemplaza la matriz de riesgo (probabilidad × impacto → nivel) |
| `POST` | `/:id/activar` | `contexto:activar` | Marca este Contexto como el activo de la organización |

### 6.8 Activos — `/api/activos`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/categorias` | `activos:leer` | Catálogo de categorías de activo |
| `GET` | `/` | `activos:leer` | Filtros: `categoriaId`, `criticidad`, `estado`, `busqueda` |
| `GET` | `/:id` | `activos:leer` | |
| `POST` | `/` | `activos:crear` | El `usuarioResponsableId` debe pertenecer a la misma organización |
| `PATCH` | `/:id` | `activos:actualizar` | |
| `PATCH` | `/:id/estado` | `activos:cambiarEstado` | `ACTIVO`/`INACTIVO`/`RETIRADO`; no permite `RETIRADO` si el activo participa en un riesgo abierto |

### 6.9 Amenazas — `/api/amenazas`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/categorias` | `amenazas:leer` |
| `GET` | `/` | `amenazas:leer` |
| `GET` | `/:id` | `amenazas:leer` |
| `POST` | `/` | `amenazas:crear` |
| `PATCH` | `/:id` | `amenazas:actualizar` |
| `DELETE` | `/:id` | `amenazas:eliminar` |

### 6.10 Vulnerabilidades — `/api/vulnerabilidades`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/categorias` | `vulnerabilidades:leer` |
| `GET` | `/` | `vulnerabilidades:leer` |
| `GET` | `/:id` | `vulnerabilidades:leer` |
| `POST` | `/` | `vulnerabilidades:crear` |
| `PATCH` | `/:id` | `vulnerabilidades:actualizar` |
| `DELETE` | `/:id` | `vulnerabilidades:eliminar` |

### 6.11 Riesgos — `/api/riesgos`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | Lista riesgos de la organización |
| `GET` | `/:id` | `riesgos:leer` | |
| `GET` | `/:id/historial` | `riesgos:leer` | Historial de cambios de estado (`RiesgoHistorial`) |
| `POST` | `/` | `riesgos:crear` | Origen `AAV` (activo+amenaza+vulnerabilidad) o `MANUAL` (título + categoría) |
| `POST` | `/:id/responsable` | `riesgos:actualizar` | Endpoint dedicado para asignar/reasignar responsable |

### 6.12 Categorías de identificación de riesgo — `/api/categorias-identificacion-riesgo`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/` | `categoriasIdentificacionRiesgo:leer` |
| `GET` | `/:id` | `categoriasIdentificacionRiesgo:leer` |
| `POST` | `/` | `categoriasIdentificacionRiesgo:crear` |
| `PATCH` | `/:id` | `categoriasIdentificacionRiesgo:actualizar` |
| `DELETE` | `/:id` | `categoriasIdentificacionRiesgo:eliminar` |

### 6.13 Evaluaciones — `/api/evaluaciones`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | |
| `GET` | `/:id` | `riesgos:leer` | |
| `POST` | `/` | `riesgos:crear` | Calcula probabilidad × impacto contra la matriz vigente; tipo `INHERENTE` o `RESIDUAL` |

### 6.14 Tratamientos — `/api/tratamientos`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | |
| `GET` | `/:id` | `riesgos:leer` | |
| `POST` | `/` | `riesgos:crear` | Estrategia: `EVITAR`/`MITIGAR`/`TRANSFERIR`/`ACEPTAR` |
| `PATCH` | `/:id` | `riesgos:actualizar` | Actualiza avance/estado/controles asociados |

### 6.15 Controles — `/api/controles`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `controles:leer` | |
| `GET` | `/:id` | `controles:leer` | |
| `GET` | `/:id/historial` | `controles:leer` | Historial de estado de implementación |
| `POST` | `/` | `controles:crear` | |
| `PUT` | `/:id` | `controles:actualizar` | |
| `DELETE` | `/:id` | `controles:eliminar` | |

### 6.16 Resoluciones de riesgo — `/api/resoluciones-riesgo`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | Filtros: `riesgoId`, `tipo` |
| `POST` | `/` | `resolucionesRiesgo:crear` | Tipo `RESOLUCION` o `REAPERTURA`, con justificación obligatoria |

### 6.17 Comentarios — `/api/comentarios`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | Filtros: exactamente uno de `riesgoId`, `evaluacionId`, `tratamientoId`, `controlId` |
| `POST` | `/` | `comentarios:crear` | Comentario polimórfico: exactamente un destino no nulo |

### 6.18 Seguimientos — `/api/seguimientos`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | Filtros: exactamente uno de `riesgoId`, `tratamientoId`, `controlId` |
| `POST` | `/` | `seguimientos:crear` | Seguimiento polimórfico (sin `evaluacionId`, a diferencia de comentarios) |

### 6.19 Evidencias — `/api/evidencias`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `riesgos:leer` | Filtros: destino polimórfico + `estado` |
| `GET` | `/:id/descargar` | `riesgos:leer` | Descarga el archivo |
| `POST` | `/` | `evidencias:crear` | `multipart/form-data` vía `uploadEvidencia` (multer); un único destino polimórfico |
| `PATCH` | `/:id/validar` | `evidencias:validar` | Marca la evidencia como `VALIDADA` o `RECHAZADA` |

### 6.20 Reportes — `/api/reportes`

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| `GET` | `/` | `reportes:leer` | Historial de reportes generados |
| `POST` | `/` | `reportes:crear` | Genera un reporte (`EJECUTIVO`/`TECNICO`/`GENERAL`) en PDF (pdfkit); formatos `XLSX`/`CSV` responden `501` |
| `GET` | `/:id/descargar` | `reportes:leer` | Descarga el PDF generado |

### 6.21 Auditoría — `/api/auditoria`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/` | `auditoria:leer` |
| `GET` | `/:id` | `auditoria:leer` |

### 6.22 Eventos de seguridad — `/api/eventos-seguridad`

| Método | Ruta | Permiso |
|---|---|---|
| `GET` | `/` | `eventosSeguridad:leer` |
| `GET` | `/:id` | `eventosSeguridad:leer` |

## 7. Salud del servicio

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Público, sin `/api`. Devuelve `{ status, service, timestamp }` |

## 8. Rate limiting aplicado a la API

Ver `SECURITY.md`, sección 9. En resumen: `apiLimiter` se aplica a todo
`/api/*`; `POST /api/auth/login` recibe adicionalmente `authLimiter`
(límite más estricto).
