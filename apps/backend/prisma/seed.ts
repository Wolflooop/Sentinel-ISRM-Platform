import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

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
  { recurso: "riesgos", accion: "crear", descripcion: "Registrar un nuevo riesgo (activo + amenaza + vulnerabilidad)" },
  { recurso: "riesgos", accion: "actualizar", descripcion: "Actualizar un riesgo o su tratamiento" },
  { recurso: "controles", accion: "leer", descripcion: "Consultar el catálogo de controles" },
  { recurso: "controles", accion: "crear", descripcion: "Registrar un nuevo control" },
  { recurso: "controles", accion: "actualizar", descripcion: "Actualizar un control existente" },
  { recurso: "controles", accion: "eliminar", descripcion: "Eliminar un control no asociado a tratamientos" },
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
  { descripcion: string; tipo: "ADMIN_TIC" | "USUARIO_COMUN"; permisos: Array<{ recurso: string; accion: string }> }
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
      { recurso: "controles", accion: "leer" },
      { recurso: "reportes", accion: "leer" },
    ],
  },
};

const ORGANIZACION_SEED = {
  nombre: "Organizacion Semilla",
  sector: "PRIVADO" as const,
  tamano: "PEQUENA" as const,
  paisIso: "CO",
};

const USUARIO_SEED = {
  nombre: "Administrador Inicial",
  email: "admin@sentinel-isrm.local",
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

const CONTEXTO_SEED = {
  alcance: "Evaluación de riesgos de seguridad de la información de la organización",
  criteriosAceptacion: "Evaluación basada en ISO/IEC 27005:2022",
};

const ESCALA_IMPACTO: Array<{ nivel: number; etiqueta: string }> = [
  { nivel: 1, etiqueta: "Muy Bajo" },
  { nivel: 2, etiqueta: "Bajo" },
  { nivel: 3, etiqueta: "Medio" },
  { nivel: 4, etiqueta: "Alto" },
  { nivel: 5, etiqueta: "Crítico" },
];

const ESCALA_PROBABILIDAD: Array<{ nivel: number; etiqueta: string }> = [
  { nivel: 1, etiqueta: "Raro" },
  { nivel: 2, etiqueta: "Poco probable" },
  { nivel: 3, etiqueta: "Posible" },
  { nivel: 4, etiqueta: "Probable" },
  { nivel: 5, etiqueta: "Casi seguro" },
];

function clasificarNivelRiesgo(valor: number): "BAJO" | "MEDIO" | "ALTO" | "CRITICO" {
  if (valor <= 4) return "BAJO";
  if (valor <= 9) return "MEDIO";
  if (valor <= 15) return "ALTO";
  return "CRITICO";
}

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

async function seedOrganizacionYUsuario(rolAdministradorId: string) {
  const organizacionSeed = await prisma.organizacion.upsert({
    where: { nombre: ORGANIZACION_SEED.nombre },
    update: {},
    create: ORGANIZACION_SEED,
  });

  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (seedAdminPassword) {
    const passwordHash = await bcrypt.hash(seedAdminPassword, 10);

    // El Administrador Principal (SUPER_ADMIN) es un usuario GLOBAL: no
    // pertenece a la organización semilla ni a ninguna otra
    // (organizacionId = null). La organización semilla se deja como
    // ejemplo de organización ya existente en la plataforma, no como el
    // "hogar" del SUPER_ADMIN.
    await prisma.usuario.upsert({
      where: { email: USUARIO_SEED.email },
      update: {},
      create: {
        organizacionId: null,
        rolId: rolAdministradorId,
        nombre: USUARIO_SEED.nombre,
        email: USUARIO_SEED.email,
        passwordHash,
      },
    });
  }

  return { organizacionSeed, adminCreado: Boolean(seedAdminPassword) };
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

async function seedAmenazas(categorias: Array<{ id: string; nombre: string }>) {
  const categoriaMap = new Map(categorias.map((c) => [c.nombre, c.id]));

  for (const a of AMENAZAS_PREDEFINIDAS) {
    const categoriaId = categoriaMap.get(a.categoria);
    if (!categoriaId) {
      throw new Error(`Categoría de amenaza no encontrada: ${a.categoria}`);
    }

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

    const existente = await prisma.vulnerabilidad.findFirst({
      where: { categoriaId, nombre: v.nombre },
    });

    if (existente) {
      await prisma.vulnerabilidad.update({
        where: { id: existente.id },
        data: { descripcion: v.descripcion, severidad: v.severidad },
      });
    } else {
      await prisma.vulnerabilidad.create({
        data: { categoriaId, nombre: v.nombre, descripcion: v.descripcion, severidad: v.severidad },
      });
    }
  }
}

async function seedControles() {
  for (const c of CONTROLES_ISO27001) {
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

async function seedContexto(organizacionId: string) {
  let contexto = await prisma.contexto.findFirst({
    where: { organizacionId, activo: true },
  });

  if (!contexto) {
    contexto = await prisma.contexto.create({
      data: {
        organizacionId,
        alcance: CONTEXTO_SEED.alcance,
        criteriosAceptacion: CONTEXTO_SEED.criteriosAceptacion,
        activo: true,
      },
    });
  }

  await Promise.all(
    ESCALA_IMPACTO.map((e) =>
      prisma.escalaImpacto.upsert({
        where: { contextoId_nivel: { contextoId: contexto!.id, nivel: e.nivel } },
        update: { etiqueta: e.etiqueta },
        create: { contextoId: contexto!.id, nivel: e.nivel, etiqueta: e.etiqueta },
      })
    )
  );

  await Promise.all(
    ESCALA_PROBABILIDAD.map((e) =>
      prisma.escalaProbabilidad.upsert({
        where: { contextoId_nivel: { contextoId: contexto!.id, nivel: e.nivel } },
        update: { etiqueta: e.etiqueta },
        create: { contextoId: contexto!.id, nivel: e.nivel, etiqueta: e.etiqueta },
      })
    )
  );

  const combinaciones: Array<{ nivelProbabilidad: number; nivelImpacto: number }> = [];
  for (let p = 1; p <= 5; p += 1) {
    for (let i = 1; i <= 5; i += 1) {
      combinaciones.push({ nivelProbabilidad: p, nivelImpacto: i });
    }
  }

  await Promise.all(
    combinaciones.map((combo) => {
      const nivelResultante = clasificarNivelRiesgo(combo.nivelProbabilidad * combo.nivelImpacto);
      return prisma.matrizRiesgo.upsert({
        where: {
          contextoId_nivelProbabilidad_nivelImpacto: {
            contextoId: contexto!.id,
            nivelProbabilidad: combo.nivelProbabilidad,
            nivelImpacto: combo.nivelImpacto,
          },
        },
        update: { nivelResultante },
        create: {
          contextoId: contexto!.id,
          nivelProbabilidad: combo.nivelProbabilidad,
          nivelImpacto: combo.nivelImpacto,
          nivelResultante,
        },
      });
    })
  );

  return contexto;
}

async function main(): Promise<void> {
  const permisosCreados = await seedPermisos();
  const rolAdministrador = await seedRoles(permisosCreados);
  const { organizacionSeed, adminCreado } = await seedOrganizacionYUsuario(rolAdministrador.id);

  const categoriasActivo = await seedCategoriasActivo();
  const categoriasAmenaza = await seedCategoriasAmenaza();
  const categoriasVulnerabilidad = await seedCategoriasVulnerabilidad();

  await seedAmenazas(categoriasAmenaza);
  await seedVulnerabilidades(categoriasVulnerabilidad);
  await seedControles();
  await seedContexto(organizacionSeed.id);

  console.log("Seed completado:");
  console.log(`  Organización: ${ORGANIZACION_SEED.nombre}`);
  console.log(`  Roles:        Administrador, ${Object.keys(ROLES_ADICIONALES).join(", ")}`);
  console.log(`  Permisos:     ${permisosCreados.length}`);
  console.log(`  Categorías activo: ${categoriasActivo.length}`);
  console.log(`  Categorías amenaza: ${categoriasAmenaza.length}`);
  console.log(`  Categorías vulnerabilidad: ${categoriasVulnerabilidad.length}`);
  console.log(`  Amenazas predefinidas: ${AMENAZAS_PREDEFINIDAS.length}`);
  console.log(`  Vulnerabilidades predefinidas: ${VULNERABILIDADES_PREDEFINIDAS.length}`);
  console.log(`  Controles ISO 27001: ${CONTROLES_ISO27001.length}`);
  console.log("  Contexto activo, escalas y matriz de riesgo 5x5 listos");
  console.log(
    adminCreado
      ? `  Usuario:      ${USUARIO_SEED.email}`
      : "  Usuario administrador: pendiente (defina SEED_ADMIN_PASSWORD y vuelva a ejecutar `npx prisma db seed`)"
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