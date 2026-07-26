# Guía de Usuario — Sentinel ISRM

Guía funcional de la plataforma Sentinel ISRM, organizada según los
módulos disponibles en la navegación de la aplicación. El acceso a cada
sección depende de los permisos y el tipo de rol del usuario autenticado
(ver `SECURITY.md`, sección 4).

## 1. Roles del sistema

| Rol | Tipo (`TipoRol`) | Alcance |
|---|---|---|
| Administrador Principal | `SUPER_ADMIN` | Global. No pertenece a ninguna organización. Administra organizaciones y ve el dashboard global de la plataforma |
| Administrador TIC | `ADMIN_TIC` | Administra la totalidad de los módulos de su organización: usuarios, contexto ISO, activos, amenazas, vulnerabilidades, riesgos, tratamientos, controles y reportes |
| Usuario Operativo | `USUARIO_COMUN` | Consulta catálogos y registra/da seguimiento a los riesgos que le son asignados como responsable, sin administrar usuarios ni roles |

Estos son los tres roles predefinidos sembrados por el sistema
(`prisma/seed.ts`); un Administrador TIC puede crear roles adicionales con
combinaciones de permisos personalizadas desde el módulo **Roles**.

## 2. Login

- Pantalla inicial de la aplicación (`/login`). Se ingresa con **correo
  electrónico** y **contraseña** (no se solicita seleccionar una
  organización: el correo es único a nivel global y el sistema resuelve la
  organización automáticamente a partir del usuario).
- Tras una cantidad de intentos fallidos configurada por el administrador
  del sistema, la cuenta queda bloqueada temporalmente.
- Al iniciar sesión correctamente, el usuario es redirigido al
  **Dashboard**.
- **Cerrar sesión** revoca la sesión inmediatamente en el servidor (no solo
  descarta el token localmente).

## 3. Usuarios

- Disponible para quienes tienen el permiso `usuarios:leer` (típicamente
  Administrador TIC y Administrador Principal).
- Permite **listar**, **crear**, **editar** y **cambiar el estado**
  (activar/desactivar) de los usuarios de la propia organización.
- La creación de usuarios está reservada a Administrador Principal y
  Administrador TIC — un Usuario Operativo nunca puede crear usuarios,
  incluso si se le asignara el permiso correspondiente.

## 4. Activos

- Inventario de los bienes de información que la organización necesita
  proteger (equipos, sistemas, información, servicios, etc.).
- Cada activo tiene una **categoría**, un **responsable** (debe pertenecer
  a la misma organización), una **criticidad** (escala 1 a 5) y un
  **estado** (`ACTIVO`, `INACTIVO`, `RETIRADO`).
- Un activo no puede marcarse como `RETIRADO` mientras participe en algún
  riesgo que todavía no esté cerrado.
- La lista de activos admite filtrar por categoría, criticidad, estado y
  búsqueda por texto.

## 5. Amenazas

- Catálogo de amenazas (`INTERNO`/`EXTERNO`) que pueden explotar
  vulnerabilidades sobre los activos.
- Incluye amenazas **globales** (predefinidas por el sistema, disponibles
  para todas las organizaciones) y amenazas propias de cada organización,
  que pueden crearse, editarse y eliminarse desde este módulo.

## 6. Vulnerabilidades

- Catálogo de debilidades concretas (severidad en escala 1 a 5,
  referencia CVE opcional) que una amenaza podría explotar.
- Mismo patrón que Amenazas: catálogo global predefinido + vulnerabilidades
  propias de la organización, con CRUD completo para estas últimas.

## 7. Gestión de riesgos

- Un riesgo puede identificarse de dos formas:
  - **Origen AAV**: seleccionando la combinación concreta de
    Activo + Amenaza + Vulnerabilidad que da lugar al escenario de riesgo.
  - **Origen MANUAL**: registrando directamente un hallazgo con título,
    descripción, justificación y una categoría del catálogo de
    identificación de riesgo.
- Cada riesgo tiene un **estado** que evoluciona a lo largo de su ciclo de
  vida: `IDENTIFICADO` → `EN_ANALISIS` → `EVALUADO` → `TRATADO` →
  `CERRADO` / `MONITOREADO` / `ACEPTADO`, con posibilidad de
  `REABIERTO` si un riesgo cerrado vuelve a activarse.
- Cada riesgo conserva un **historial** completo de sus cambios de estado,
  consultable desde su detalle.
- El **responsable** de un riesgo se asigna mediante una acción dedicada
  (no como parte de una edición general); solo un Administrador TIC puede
  **reasignar** el responsable de un riesgo ya asignado.
- La **matriz de riesgo** (`/riesgos/matriz`) ofrece una vista consolidada
  de los riesgos ubicados según su nivel de probabilidad e impacto,
  siguiendo la matriz configurada en el Contexto ISO activo.

## 8. Evaluación

- Una evaluación calcula el **nivel de riesgo** (`probabilidad × impacto`)
  contra la matriz vigente del Contexto ISO de la organización, y produce
  un **resultado**: `ACEPTABLE` o `NO_ACEPTABLE`.
- Un mismo riesgo puede tener varias evaluaciones a lo largo del tiempo:
  una evaluación **inherente** (antes de aplicar tratamiento) y una o
  varias evaluaciones **residuales** posteriores (para medir si el
  tratamiento aplicado realmente redujo el riesgo).
- El historial completo de evaluaciones de un riesgo es consultable desde
  su detalle.

## 9. Tratamientos

- Cuando una evaluación resulta `NO_ACEPTABLE`, se registra un
  **tratamiento**: la decisión de cómo abordar el riesgo, con una
  **estrategia** (`EVITAR`, `MITIGAR`, `TRANSFERIR`, `ACEPTAR`), un plan
  descrito, un responsable de ejecución, una fecha límite y, opcionalmente,
  una aprobación formal (quién aprueba y cuándo).
- El avance del tratamiento se expresa como un **porcentaje** (0–100) y un
  **estado** (`PROPUESTO`, `EN_EJECUCION`, `COMPLETADO`, `VENCIDO`).
- Un tratamiento puede vincularse a uno o varios **controles** concretos
  que efectivamente lo implementan, marcando cuál es el control principal.

## 10. Controles

- Catálogo de salvaguardas (`PREVENTIVO`, `DETECTIVO`, `CORRECTIVO`),
  opcionalmente referenciadas a un código del Anexo A de ISO/IEC 27001.
- Incluye controles **globales de referencia** y controles propios de la
  organización.
- Cada control tiene un **estado de implementación** propio
  (`NO_INICIADO` → `EN_PROGRESO` → `IMPLEMENTADO` → `VERIFICADO`), con
  historial de cambios consultable desde su detalle. La fecha de
  implementación solo puede registrarse una vez que el control alcanza el
  estado `IMPLEMENTADO`.

## 11. Comentarios, seguimientos y evidencias

Disponibles desde el detalle de un Riesgo, Evaluación, Tratamiento o
Control (según corresponda):

- **Comentarios**: notas de texto asociadas a exactamente un
  riesgo, evaluación, tratamiento o control.
- **Seguimientos**: registros de avance o novedades asociados a
  exactamente un riesgo, tratamiento o control.
- **Evidencias**: archivos adjuntos (documentos de soporte) asociados a
  exactamente un riesgo, tratamiento o control. Una evidencia subida queda
  en estado `SUBIDA` hasta que un usuario autorizado la **valida** o
  **rechaza**, dejando un comentario de validación.

## 12. Reportes

- Genera reportes descargables en **PDF** de tres tipos: **Ejecutivo**,
  **Técnico** y **General**, con los datos consolidados de la
  organización.
- El historial de reportes generados queda disponible para su descarga
  posterior desde el mismo módulo.
- Los formatos `XLSX` y `CSV` están contemplados en el modelo de datos
  pero **no están implementados** todavía: solicitarlos devuelve un error
  indicando que el formato aún no está disponible.

## 13. Contexto ISO

- Módulo donde la organización define su **alcance** y sus **criterios de
  aceptación de riesgo** (Contexto ISO/IEC 27005).
- Permite configurar la **escala de impacto** y la **escala de
  probabilidad** (niveles 1 a 5, cada uno con etiqueta y descripción), y la
  **matriz de riesgo** resultante (qué combinación de probabilidad e
  impacto produce cada nivel de riesgo).
- Una organización puede tener varios Contextos a lo largo del tiempo,
  pero solo uno puede estar **activo** en un momento dado; activar un
  Contexto nuevo es una acción explícita y dedicada.

## 14. Auditoría

- Consulta de solo lectura del rastro de auditoría de la organización:
  quién hizo qué cambio, sobre qué entidad, cuándo, desde qué dirección
  IP, y los valores anteriores/nuevos del cambio.

## 15. Eventos de seguridad

- Consulta de solo lectura del registro de eventos de autenticación y
  sesión de la organización: inicios de sesión exitosos y fallidos,
  cierres de sesión, sesiones expiradas e intentos de acceso denegados por
  falta de permisos, con su severidad y detalle técnico.

## 16. Dashboard

- **Dashboard de organización**: indicadores operativos de la propia
  organización (distribución de riesgos por nivel, estado de controles,
  usuarios por rol, actividad reciente).
- **Dashboard global** (`/dashboard/global` equivalente en backend
  `GET /api/dashboard/global`): exclusivo del Administrador Principal,
  con indicadores agregados de toda la plataforma.

## 17. Organizaciones

- El Administrador Principal administra el listado completo de
  organizaciones (tenants) de la plataforma y puede dar de alta nuevas
  organizaciones.
- Cada organización gestiona sus propios datos generales y su estado
  (`ACTIVA`/`SUSPENDIDA`/`INACTIVA`) desde **Mi organización**, disponible
  para Administrador TIC y Administrador Principal.
