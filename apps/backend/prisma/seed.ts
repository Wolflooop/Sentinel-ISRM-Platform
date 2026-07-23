import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ============================================================================
// SEED — SOLO DATOS GLOBALES DEL SISTEMA
//
// Este seed NO crea organizaciones, usuarios de organización, contextos,
// escalas, matrices, activos, riesgos, tratamientos, evaluaciones, sesiones,
// auditorías, eventos ni reportes. Sentinel ISRM es una plataforma SaaS
// multiempresa: las organizaciones se crean desde la aplicación (SUPER_ADMIN)
// mediante un bootstrap transaccional propio (organizations.service), nunca
// mediante este archivo ni mediante variables de entorno.
//
// Este seed es idempotente y solo produce:
//   1. Roles (SUPER_ADMIN, ADMIN_TIC, USUARIO_COMUN)
//   2. Todos los permisos del catálogo
//   3. RolPermiso
//   4. Categorías globales (activo, amenaza, vulnerabilidad, identificación
//      de riesgo)
//   5. Catálogos ISO (amenazas predefinidas, vulnerabilidades predefinidas,
//      controles ISO 27001)
//   6. El usuario SUPER_ADMIN inicial (global, organizacionId = null)
// ============================================================================

const PERMISOS: Array<{ recurso: string; accion: string; descripcion: string }> = [
  { recurso: "usuarios", accion: "leer", descripcion: "Consultar usuarios de la organización" },
  { recurso: "usuarios", accion: "crear", descripcion: "Crear usuarios en la organización" },
  { recurso: "usuarios", accion: "actualizar", descripcion: "Actualizar datos de usuarios" },
  { recurso: "usuarios", accion: "cambiarEstado", descripcion: "Activar/desactivar usuarios" },
  { recurso: "roles", accion: "leer", descripcion: "Consultar roles y sus permisos" },
  { recurso: "roles", accion: "crear", descripcion: "Crear nuevos roles" },
  { recurso: "roles", accion: "actualizar", descripcion: "Actualizar nombre/descripción de roles" },
  { recurso: "roles", accion: "gestionarPermisos", descripcion: "Asignar o quitar permisos de un rol" },
  { recurso: "permisos", accion: "leer", descripcion: "Consultar el catálogo de permisos" },
  { recurso: "organizaciones", accion: "leer", descripcion: "Consultar los datos de la propia organización" },
  { recurso: "organizaciones", accion: "crear", descripcion: "Crear una nueva organización (solo Administrador Principal)" },
  { recurso: "organizaciones", accion: "actualizar", descripcion: "Actualizar los datos de la propia organización" },
  { recurso: "organizaciones", accion: "cambiarEstado", descripcion: "Activar/suspender/desactivar la propia organización" },
  { recurso: "contexto", accion: "leer", descripcion: "Consultar el Contexto ISO y su configuración" },
  { recurso: "contexto", accion: "crear", descripcion: "Crear un nuevo Contexto ISO" },
  { recurso: "contexto", accion: "actualizar", descripcion: "Actualizar alcance/criterios y configurar escalas/matriz de un Contexto ISO" },
  { recurso: "contexto", accion: "activar", descripcion: "Activar un Contexto ISO" },
  { recurso: "activos", accion: "leer", descripcion: "Consultar el inventario de activos" },
  { recurso: "activos", accion: "crear", descripcion: "Registrar un nuevo activo" },
  { recurso: "activos", accion: "actualizar", descripcion: "Actualizar datos de un activo" },
  { recurso: "activos", accion: "cambiarEstado", descripcion: "Activar/desactivar/retirar un activo" },
  { recurso: "amenazas", accion: "leer", descripcion: "Consultar el catálogo de amenazas" },
  { recurso: "amenazas", accion: "crear", descripcion: "Registrar una amenaza propia" },
  { recurso: "amenazas", accion: "actualizar", descripcion: "Actualizar una amenaza propia" },
  { recurso: "amenazas", accion: "eliminar", descripcion: "Eliminar una amenaza propia" },
  { recurso: "vulnerabilidades", accion: "leer", descripcion: "Consultar el catálogo de vulnerabilidades" },
  { recurso: "vulnerabilidades", accion: "crear", descripcion: "Registrar una vulnerabilidad en el catálogo" },
  { recurso: "vulnerabilidades", accion: "actualizar", descripcion: "Actualizar una vulnerabilidad del catálogo" },
  { recurso: "vulnerabilidades", accion: "eliminar", descripcion: "Eliminar una vulnerabilidad del catálogo" },
  { recurso: "riesgos", accion: "leer", descripcion: "Consultar los riesgos identificados" },
  { recurso: "riesgos", accion: "crear", descripcion: "Registrar un nuevo riesgo (origen AAV o MANUAL)" },
  { recurso: "riesgos", accion: "actualizar", descripcion: "Actualizar un riesgo, su evaluación o su tratamiento" },
  { recurso: "categoriasIdentificacionRiesgo", accion: "leer", descripcion: "Consultar el catálogo de categorías de identificación de riesgo manual" },
  { recurso: "categoriasIdentificacionRiesgo", accion: "crear", descripcion: "Registrar una categoría de identificación de riesgo" },
  { recurso: "categoriasIdentificacionRiesgo", accion: "actualizar", descripcion: "Actualizar una categoría de identificación de riesgo" },
  { recurso: "categoriasIdentificacionRiesgo", accion: "eliminar", descripcion: "Eliminar una categoría de identificación de riesgo no utilizada" },
  { recurso: "evaluaciones", accion: "leer", descripcion: "Consultar las evaluaciones de un riesgo" },
  { recurso: "evaluaciones", accion: "crear", descripcion: "Registrar una nueva evaluación (inherente o residual) de un riesgo" },
  { recurso: "evaluaciones", accion: "actualizar", descripcion: "Actualizar una evaluación de riesgo existente" },
  { recurso: "resolucionesRiesgo", accion: "leer", descripcion: "Consultar el historial de resoluciones/reaperturas de un riesgo" },
  { recurso: "resolucionesRiesgo", accion: "crear", descripcion: "Resolver o reabrir un riesgo" },
  { recurso: "comentarios", accion: "leer", descripcion: "Consultar comentarios de riesgos, evaluaciones, tratamientos o controles" },
  { recurso: "comentarios", accion: "crear", descripcion: "Registrar un comentario" },
  { recurso: "seguimientos", accion: "leer", descripcion: "Consultar seguimientos de riesgos, tratamientos o controles" },
  { recurso: "seguimientos", accion: "crear", descripcion: "Registrar un seguimiento" },
  { recurso: "evidencias", accion: "leer", descripcion: "Consultar y descargar evidencias de riesgos, tratamientos o controles" },
  { recurso: "evidencias", accion: "crear", descripcion: "Subir una evidencia" },
  { recurso: "evidencias", accion: "validar", descripcion: "Validar o rechazar una evidencia subida" },
  { recurso: "controles", accion: "leer", descripcion: "Consultar el catálogo de controles" },
  { recurso: "controles", accion: "crear", descripcion: "Registrar un nuevo control" },
  { recurso: "controles", accion: "actualizar", descripcion: "Actualizar un control existente" },
  { recurso: "controles", accion: "eliminar", descripcion: "Eliminar un control no asociado a tratamientos" },
  { recurso: "tratamientos", accion: "leer", descripcion: "Consultar los tratamientos asociados a un riesgo" },
  { recurso: "tratamientos", accion: "crear", descripcion: "Registrar un nuevo tratamiento para un riesgo" },
  { recurso: "tratamientos", accion: "actualizar", descripcion: "Actualizar el avance, estado o controles de un tratamiento" },
  { recurso: "reportes", accion: "leer", descripcion: "Consultar y descargar reportes generados" },
  { recurso: "reportes", accion: "crear", descripcion: "Generar un nuevo reporte" },
  { recurso: "auditoria", accion: "leer", descripcion: "Consultar el rastro de auditoría de la organización" },
  { recurso: "eventosSeguridad", accion: "leer", descripcion: "Consultar el registro de eventos de seguridad de la organización" },
];

const ROL_ADMINISTRADOR = {
  nombre: "Administrador",
  descripcion:
    "Administrador Principal del sistema (SUPER_ADMIN). Usuario global, no pertenece a ninguna organización.",
  tipo: "SUPER_ADMIN" as const,
};

const ROLES_ADICIONALES: Record<
  string,
  {
    descripcion: string;
    tipo: "ADMIN_TIC" | "USUARIO_COMUN";
    permisos: Array<{
      recurso: string;
      accion: string;
    }>;
  }
> = {
  "Administrador TIC": {
    descripcion: "Gestiona contexto ISO, activos, amenazas, vulnerabilidades, riesgos, tratamientos, controles y reportes de su propia organización",
    tipo: "ADMIN_TIC",
    permisos: [
      { recurso: "usuarios", accion: "leer" },
      { recurso: "usuarios", accion: "crear" },
      { recurso: "usuarios", accion: "actualizar" },
      { recurso: "usuarios", accion: "cambiarEstado" },
      { recurso: "roles", accion: "leer" },
      { recurso: "organizaciones", accion: "leer" },
      { recurso: "contexto", accion: "leer" },
      { recurso: "contexto", accion: "crear" },
      { recurso: "contexto", accion: "actualizar" },
      { recurso: "contexto", accion: "activar" },
      { recurso: "activos", accion: "leer" },
      { recurso: "activos", accion: "crear" },
      { recurso: "activos", accion: "actualizar" },
      { recurso: "activos", accion: "cambiarEstado" },
      { recurso: "amenazas", accion: "leer" },
      { recurso: "amenazas", accion: "crear" },
      { recurso: "amenazas", accion: "actualizar" },
      { recurso: "amenazas", accion: "eliminar" },
      { recurso: "vulnerabilidades", accion: "leer" },
      { recurso: "vulnerabilidades", accion: "crear" },
      { recurso: "vulnerabilidades", accion: "actualizar" },
      { recurso: "vulnerabilidades", accion: "eliminar" },
      { recurso: "riesgos", accion: "leer" },
      { recurso: "riesgos", accion: "crear" },
      { recurso: "riesgos", accion: "actualizar" },
      { recurso: "categoriasIdentificacionRiesgo", accion: "leer" },
      { recurso: "categoriasIdentificacionRiesgo", accion: "crear" },
      { recurso: "categoriasIdentificacionRiesgo", accion: "actualizar" },
      { recurso: "categoriasIdentificacionRiesgo", accion: "eliminar" },
      { recurso: "evaluaciones", accion: "leer" },
      { recurso: "evaluaciones", accion: "crear" },
      { recurso: "evaluaciones", accion: "actualizar" },
      { recurso: "tratamientos", accion: "leer" },
      { recurso: "tratamientos", accion: "crear" },
      { recurso: "tratamientos", accion: "actualizar" },
      { recurso: "resolucionesRiesgo", accion: "leer" },
      { recurso: "resolucionesRiesgo", accion: "crear" },
      { recurso: "comentarios", accion: "leer" },
      { recurso: "comentarios", accion: "crear" },
      { recurso: "seguimientos", accion: "leer" },
      { recurso: "seguimientos", accion: "crear" },
      { recurso: "evidencias", accion: "leer" },
      { recurso: "evidencias", accion: "crear" },
      { recurso: "evidencias", accion: "validar" },
      { recurso: "controles", accion: "leer" },
      { recurso: "controles", accion: "crear" },
      { recurso: "controles", accion: "actualizar" },
      { recurso: "controles", accion: "eliminar" },
      { recurso: "reportes", accion: "leer" },
      { recurso: "reportes", accion: "crear" },
      { recurso: "auditoria", accion: "leer" },
      { recurso: "eventosSeguridad", accion: "leer" },
    ],
  },
  "Usuario Operativo": {
    descripcion: "Consulta catálogos y registra/da seguimiento a riesgos permitidos, sin administración de usuarios ni roles",
    tipo: "USUARIO_COMUN",
    permisos: [
      { recurso: "organizaciones", accion: "leer" },
      { recurso: "contexto", accion: "leer" },
      { recurso: "activos", accion: "leer" },
      { recurso: "amenazas", accion: "leer" },
      { recurso: "vulnerabilidades", accion: "leer" },
      { recurso: "riesgos", accion: "leer" },
      { recurso: "riesgos", accion: "crear" },
      { recurso: "categoriasIdentificacionRiesgo", accion: "leer" },
      { recurso: "resolucionesRiesgo", accion: "leer" },
      { recurso: "resolucionesRiesgo", accion: "crear" },
      { recurso: "comentarios", accion: "leer" },
      { recurso: "comentarios", accion: "crear" },
      { recurso: "seguimientos", accion: "leer" },
      { recurso: "seguimientos", accion: "crear" },
      { recurso: "evidencias", accion: "leer" },
      { recurso: "evidencias", accion: "crear" },
      { recurso: "controles", accion: "leer" },
      { recurso: "reportes", accion: "leer" },
    ],
  },
};

const SUPER_ADMIN_SEED = {
  nombre: "Administrador Principal",
  email: process.env.SEED_ADMIN_EMAIL ?? "admin@sentinel.local",
};

const CATEGORIAS_ACTIVO: Array<{ nombre: string; descripcion: string }> = [
  { nombre: "Información", descripcion: "Datos, documentos y bases de datos con valor para la organización" },
  { nombre: "Software", descripcion: "Aplicaciones, sistemas operativos y herramientas" },
  { nombre: "Hardware", descripcion: "Equipos de cómputo, servidores y dispositivos de red" },
  { nombre: "Infraestructura", descripcion: "Componentes de red, energía y telecomunicaciones" },
  { nombre: "Servicios", descripcion: "Servicios de TI internos o contratados con terceros" },
  { nombre: "Personal", descripcion: "Colaboradores con conocimiento o acceso crítico" },
  { nombre: "Instalaciones", descripcion: "Infraestructura física y sitios de operación" },
  { nombre: "Documentación", descripcion: "Manuales, procedimientos y documentación técnica u operativa" },
];

const CATEGORIAS_AMENAZA: Array<{ nombre: string; descripcion: string }> = [
  { nombre: "Acciones no autorizadas", descripcion: "Uso indebido de recursos por personas sin autorización" },
  { nombre: "Compromiso de información", descripcion: "Exposición, alteración o pérdida no autorizada de datos" },
  { nombre: "Fallas técnicas", descripcion: "Mal funcionamiento de hardware o software" },
  { nombre: "Daños físicos", descripcion: "Destrucción o deterioro físico de activos" },
  { nombre: "Eventos naturales", descripcion: "Fenómenos naturales que afectan la operación" },
  { nombre: "Interrupción de servicios", descripcion: "Pérdida de disponibilidad de servicios esenciales" },
  { nombre: "Errores humanos", descripcion: "Equivocaciones de personal autorizado en la operación" },
  { nombre: "Ataques externos", descripcion: "Acciones maliciosas originadas fuera de la organización" },
];

const CATEGORIAS_VULNERABILIDAD: Array<{ nombre: string; descripcion: string }> = [
  { nombre: "Hardware", descripcion: "Debilidades en equipos físicos" },
  { nombre: "Software", descripcion: "Debilidades en aplicaciones y sistemas" },
  { nombre: "Red", descripcion: "Debilidades en la infraestructura de comunicaciones" },
  { nombre: "Configuración", descripcion: "Debilidades derivadas de configuraciones inseguras" },
  { nombre: "Personal", descripcion: "Debilidades derivadas de prácticas o capacitación del personal" },
  { nombre: "Procesos", descripcion: "Debilidades en procedimientos operativos" },
  { nombre: "Infraestructura", descripcion: "Debilidades en la infraestructura física o de soporte" },
];

const CATEGORIAS_IDENTIFICACION_RIESGO: Array<{ nombre: string; descripcion: string }> = [
  { nombre: "Auditoría interna", descripcion: "Riesgo identificado durante una auditoría interna de la organización" },
  { nombre: "Auditoría externa", descripcion: "Riesgo identificado por un auditor o ente externo" },
  { nombre: "Incidente reportado", descripcion: "Riesgo identificado a partir de un incidente de seguridad ya ocurrido" },
  { nombre: "Cambio regulatorio", descripcion: "Riesgo identificado a partir de un nuevo requisito legal o normativo" },
  { nombre: "Cambio organizacional", descripcion: "Riesgo identificado a partir de un cambio de estructura, proceso o proveedor" },
  { nombre: "Observación directa", descripcion: "Riesgo identificado directamente por el responsable durante la operación diaria" },
];

const AMENAZAS_PREDEFINIDAS: Array<{
  nombre: string;
  descripcion: string;
  origen: "INTERNO" | "EXTERNO";
  categoria: string;
}> = [
  { nombre: "Acceso no autorizado", descripcion: "Ingreso a sistemas sin las credenciales o permisos correspondientes", origen: "EXTERNO", categoria: "Acciones no autorizadas" },
  { nombre: "Robo de información", descripcion: "Sustracción de información confidencial", origen: "EXTERNO", categoria: "Compromiso de información" },
  { nombre: "Fuga de información", descripcion: "Salida no controlada de información fuera de la organización", origen: "INTERNO", categoria: "Compromiso de información" },
  { nombre: "Modificación no autorizada de datos", descripcion: "Alteración de información sin autorización", origen: "INTERNO", categoria: "Compromiso de información" },
  { nombre: "Malware", descripcion: "Software malicioso que compromete la confidencialidad, integridad o disponibilidad", origen: "EXTERNO", categoria: "Ataques externos" },
  { nombre: "Phishing", descripcion: "Suplantación para obtener credenciales o información sensible", origen: "EXTERNO", categoria: "Ataques externos" },
  { nombre: "Ransomware", descripcion: "Cifrado malicioso de información con fines de extorsión", origen: "EXTERNO", categoria: "Ataques externos" },
  { nombre: "Ataque de fuerza bruta", descripcion: "Intentos automatizados de vulnerar credenciales de acceso", origen: "EXTERNO", categoria: "Ataques externos" },
  { nombre: "Denegación de servicio", descripcion: "Saturación intencional que impide el uso normal de un servicio", origen: "EXTERNO", categoria: "Interrupción de servicios" },
  { nombre: "Fallo de hardware", descripcion: "Avería de un componente físico crítico", origen: "INTERNO", categoria: "Fallas técnicas" },
  { nombre: "Fallo de software", descripcion: "Mal funcionamiento de una aplicación o sistema", origen: "INTERNO", categoria: "Fallas técnicas" },
  { nombre: "Caída de servicios", descripcion: "Interrupción no planificada de un servicio esencial", origen: "INTERNO", categoria: "Interrupción de servicios" },
];

const VULNERABILIDADES_PREDEFINIDAS: Array<{
  nombre: string;
  descripcion: string;
  severidad: number;
  categoria: string;
}> = [
  { nombre: "Sistemas sin actualizar", descripcion: "Sistemas operativos o aplicaciones sin parches de seguridad vigentes", severidad: 5, categoria: "Software" },
  { nombre: "Contraseñas débiles", descripcion: "Credenciales fácilmente adivinables o reutilizadas", severidad: 5, categoria: "Personal" },
  { nombre: "Falta de MFA", descripcion: "Ausencia de autenticación multifactor en accesos críticos", severidad: 4, categoria: "Configuración" },
  { nombre: "Software sin soporte", descripcion: "Uso de software fuera de su ciclo de vida oficial", severidad: 4, categoria: "Software" },
  { nombre: "Puertos abiertos innecesarios", descripcion: "Servicios expuestos sin justificación operativa", severidad: 4, categoria: "Red" },
  { nombre: "Configuración insegura", descripcion: "Parámetros de configuración por debajo del estándar recomendado", severidad: 4, categoria: "Configuración" },
  { nombre: "Permisos excesivos", descripcion: "Asignación de privilegios superiores a los necesarios", severidad: 3, categoria: "Configuración" },
  { nombre: "Falta de respaldos", descripcion: "Ausencia de copias de seguridad periódicas y verificadas", severidad: 5, categoria: "Procesos" },
  { nombre: "Ausencia de monitoreo", descripcion: "Falta de supervisión activa de eventos y actividades", severidad: 3, categoria: "Procesos" },
  { nombre: "Código vulnerable", descripcion: "Defectos de seguridad en el desarrollo de software propio", severidad: 4, categoria: "Software" },
];

const CONTROLES_ISO27001: Array<{
  codigoIso27001: string;
  nombre: string;
  tipo: "PREVENTIVO" | "DETECTIVO" | "CORRECTIVO";
}> = [
  { codigoIso27001: "A.5.1", nombre: "Políticas de seguridad de la información", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.5.2", nombre: "Roles y responsabilidades de seguridad de la información", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.5.9", nombre: "Inventario de información y otros activos asociados", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.5.15", nombre: "Control de acceso", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.5.23", nombre: "Seguridad de la información en el uso de servicios en la nube", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.6.3", nombre: "Concienciación, educación y capacitación en seguridad de la información", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.6.7", nombre: "Trabajo remoto", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.7.1", nombre: "Perímetros de seguridad física", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.7.8", nombre: "Emplazamiento y protección de equipos", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.8.1", nombre: "Dispositivos endpoint de usuario", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.8.5", nombre: "Autenticación segura", tipo: "PREVENTIVO" },
  { codigoIso27001: "A.8.8", nombre: "Gestión de vulnerabilidades técnicas", tipo: "DETECTIVO" },
  { codigoIso27001: "A.8.13", nombre: "Copias de seguridad de la información", tipo: "CORRECTIVO" },
  { codigoIso27001: "A.8.15", nombre: "Registro de eventos", tipo: "DETECTIVO" },
  { codigoIso27001: "A.8.16", nombre: "Actividades de monitoreo", tipo: "DETECTIVO" },
  { codigoIso27001: "A.8.24", nombre: "Uso de criptografía", tipo: "PREVENTIVO" },
];

async function seedPermisos() {
  return Promise.all(
    PERMISOS.map((p) =>
      prisma.permiso.upsert({
        where: { recurso_accion: { recurso: p.recurso, accion: p.accion } },
        update: { descripcion: p.descripcion },
        create: p,
      })
    )
  );
}

async function seedRoles(permisosCreados: Array<{ id: string; recurso: string; accion: string }>) {
  const permisoMap = new Map(permisosCreados.map((p) => [`${p.recurso}:${p.accion}`, p]));

  const rolAdministrador = await prisma.rol.upsert({
    where: { nombre: ROL_ADMINISTRADOR.nombre },
    update: { descripcion: ROL_ADMINISTRADOR.descripcion, tipo: ROL_ADMINISTRADOR.tipo },
    create: { ...ROL_ADMINISTRADOR, esSistema: true },
  });

  await Promise.all(
    permisosCreados.map((permiso) =>
      prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: rolAdministrador.id, permisoId: permiso.id } },
        update: {},
        create: { rolId: rolAdministrador.id, permisoId: permiso.id },
      })
    )
  );

  for (const [nombreRol, config] of Object.entries(ROLES_ADICIONALES)) {
    const rol = await prisma.rol.upsert({
      where: { nombre: nombreRol },
      update: { descripcion: config.descripcion, tipo: config.tipo },
      create: { nombre: nombreRol, descripcion: config.descripcion, tipo: config.tipo, esSistema: true },
    });

    await Promise.all(
      config.permisos.map((p) => {
        const permiso = permisoMap.get(`${p.recurso}:${p.accion}`);
        if (!permiso) {
          throw new Error(`Permiso no encontrado en catálogo: ${p.recurso}:${p.accion}`);
        }
        return prisma.rolPermiso.upsert({
          where: { rolId_permisoId: { rolId: rol.id, permisoId: permiso.id } },
          update: {},
          create: { rolId: rol.id, permisoId: permiso.id },
        });
      })
    );
  }

  return rolAdministrador;
}

async function seedSuperAdminInicial(rolAdministradorId: string) {
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!seedAdminPassword) {
    return { adminCreado: false };
  }

  const passwordHash = await bcrypt.hash(seedAdminPassword, 10);

  await prisma.usuario.upsert({
    where: { email: SUPER_ADMIN_SEED.email },
    update: { passwordHash },
    create: {
      organizacionId: null,
      rolId: rolAdministradorId,
      nombre: SUPER_ADMIN_SEED.nombre,
      email: SUPER_ADMIN_SEED.email,
      passwordHash,
    },
  });

  return { adminCreado: true };
}

async function seedCategoriasActivo() {
  return Promise.all(
    CATEGORIAS_ACTIVO.map((c) =>
      prisma.categoriaActivo.upsert({
        where: { nombre: c.nombre },
        update: { descripcion: c.descripcion },
        create: c,
      })
    )
  );
}

async function seedCategoriasAmenaza() {
  return Promise.all(
    CATEGORIAS_AMENAZA.map((c) =>
      prisma.categoriaAmenaza.upsert({
        where: { nombre: c.nombre },
        update: { descripcion: c.descripcion },
        create: c,
      })
    )
  );
}

async function seedCategoriasVulnerabilidad() {
  return Promise.all(
    CATEGORIAS_VULNERABILIDAD.map((c) =>
      prisma.categoriaVulnerabilidad.upsert({
        where: { nombre: c.nombre },
        update: { descripcion: c.descripcion },
        create: c,
      })
    )
  );
}

async function seedCategoriasIdentificacionRiesgo() {
  return Promise.all(
    CATEGORIAS_IDENTIFICACION_RIESGO.map((c) =>
      prisma.categoriaIdentificacionRiesgo.upsert({
        where: { nombre: c.nombre },
        update: { descripcion: c.descripcion },
        create: c,
      })
    )
  );
}

async function seedAmenazas(categorias: Array<{ id: string; nombre: string }>) {
  const categoriaMap = new Map(categorias.map((c) => [c.nombre, c.id]));

  for (const a of AMENAZAS_PREDEFINIDAS) {
    const categoriaId = categoriaMap.get(a.categoria);
    if (!categoriaId) {
      throw new Error(`Categoría de amenaza no encontrada: ${a.categoria}`);
    }

    // NOTA (auditoría): no se usa upsert aquí porque el @@unique([organizacionId, nombre])
    // no es fiable con organizacionId = null en PostgreSQL (NULL != NULL en UNIQUE).
    const existente = await prisma.amenaza.findFirst({
      where: { organizacionId: null, nombre: a.nombre },
    });

    if (existente) {
      await prisma.amenaza.update({
        where: { id: existente.id },
        data: {
          descripcion: a.descripcion,
          origen: a.origen,
          categoriaId,
          esPredefinida: true,
        },
      });
    } else {
      await prisma.amenaza.create({
        data: {
          nombre: a.nombre,
          descripcion: a.descripcion,
          origen: a.origen,
          categoriaId,
          organizacionId: null,
          esPredefinida: true,
        },
      });
    }
  }
}

async function seedVulnerabilidades(categorias: Array<{ id: string; nombre: string }>) {
  const categoriaMap = new Map(categorias.map((c) => [c.nombre, c.id]));

  for (const v of VULNERABILIDADES_PREDEFINIDAS) {
    const categoriaId = categoriaMap.get(v.categoria);
    if (!categoriaId) {
      throw new Error(`Categoría de vulnerabilidad no encontrada: ${v.categoria}`);
    }

    // Mismo motivo que Amenaza: @@unique([organizacionId, nombre]) con
    // organizacionId nullable no es fiable para upsert.
    const existente = await prisma.vulnerabilidad.findFirst({
      where: { organizacionId: null, nombre: v.nombre },
    });

    if (existente) {
      await prisma.vulnerabilidad.update({
        where: { id: existente.id },
        data: { categoriaId, descripcion: v.descripcion, severidad: v.severidad, esPredefinida: true },
      });
    } else {
      await prisma.vulnerabilidad.create({
        data: {
          categoriaId,
          nombre: v.nombre,
          descripcion: v.descripcion,
          severidad: v.severidad,
          organizacionId: null,
          esPredefinida: true,
        },
      });
    }
  }
}

async function seedControles() {
  for (const c of CONTROLES_ISO27001) {
    // NOTA (auditoría): Control.codigoIso27001 NO tiene @unique ni @@unique
    // en el schema ("Sin restricción UNIQUE" — comentario explícito del
    // propio modelo). Un upsert con ese campo sería inválido; se usa
    // findFirst + update/create.
    const existente = await prisma.control.findFirst({
      where: { organizacionId: null, codigoIso27001: c.codigoIso27001 },
    });

    if (existente) {
      await prisma.control.update({
        where: { id: existente.id },
        data: { nombre: c.nombre, tipo: c.tipo },
      });
    } else {
      await prisma.control.create({
        data: {
          organizacionId: null,
          codigoIso27001: c.codigoIso27001,
          nombre: c.nombre,
          tipo: c.tipo,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  const permisosCreados = await seedPermisos();
  const rolAdministrador = await seedRoles(permisosCreados);
  const { adminCreado } = await seedSuperAdminInicial(rolAdministrador.id);

  const categoriasActivo = await seedCategoriasActivo();
  const categoriasAmenaza = await seedCategoriasAmenaza();
  const categoriasVulnerabilidad = await seedCategoriasVulnerabilidad();
  const categoriasIdentificacionRiesgo = await seedCategoriasIdentificacionRiesgo();

  await seedAmenazas(categoriasAmenaza);
  await seedVulnerabilidades(categoriasVulnerabilidad);
  await seedControles();

  console.log("Seed completado (solo datos globales):");
  console.log(`  Roles:        Administrador, ${Object.keys(ROLES_ADICIONALES).join(", ")}`);
  console.log(`  Permisos:     ${permisosCreados.length}`);
  console.log(`  Categorías activo: ${categoriasActivo.length}`);
  console.log(`  Categorías amenaza: ${categoriasAmenaza.length}`);
  console.log(`  Categorías vulnerabilidad: ${categoriasVulnerabilidad.length}`);
  console.log(`  Categorías identificación de riesgo (manual): ${categoriasIdentificacionRiesgo.length}`);
  console.log(`  Amenazas predefinidas: ${AMENAZAS_PREDEFINIDAS.length}`);
  console.log(`  Vulnerabilidades predefinidas: ${VULNERABILIDADES_PREDEFINIDAS.length}`);
  console.log(`  Controles ISO 27001: ${CONTROLES_ISO27001.length}`);
  console.log("  Organizaciones: 0 (se crean desde la aplicación vía bootstrap transaccional)");
  console.log("  Usuarios de organización: 0");
  console.log(
    adminCreado
      ? `  Usuario SUPER_ADMIN: ${SUPER_ADMIN_SEED.email}`
      : "  Usuario SUPER_ADMIN: pendiente (defina SEED_ADMIN_PASSWORD y vuelva a ejecutar `npx prisma db seed`)"
  );
}

main()
  .catch((err) => {
    console.error("Error ejecutando el seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });