import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * Catálogo de permisos necesarios para que el RBAC dinámico funcione,
 * acumulado a través de las fases (auth, usuarios/roles/permisos,
 * organizaciones, contexto ISO, ...). Ningún permiso queda hardcodeado
 * dentro del código de autorización (middleware/authorize.ts) — todo se
 * resuelve consultando estas filas vía Rol → RolPermiso → Permiso.
 */
const PERMISOS: Array<{ recurso: string; accion: string; descripcion: string }> = [
  { recurso: "usuarios", accion: "leer", descripcion: "Consultar usuarios de la organización" },
  { recurso: "usuarios", accion: "crear", descripcion: "Crear usuarios en la organización" },
  { recurso: "usuarios", accion: "actualizar", descripcion: "Actualizar datos de usuarios" },
  {
    recurso: "usuarios",
    accion: "cambiarEstado",
    descripcion: "Activar/desactivar usuarios",
  },
  { recurso: "roles", accion: "leer", descripcion: "Consultar roles y sus permisos" },
  { recurso: "roles", accion: "crear", descripcion: "Crear nuevos roles" },
  { recurso: "roles", accion: "actualizar", descripcion: "Actualizar nombre/descripción de roles" },
  {
    recurso: "roles",
    accion: "gestionarPermisos",
    descripcion: "Asignar o quitar permisos de un rol",
  },
  { recurso: "permisos", accion: "leer", descripcion: "Consultar el catálogo de permisos" },
  {
    recurso: "organizaciones",
    accion: "leer",
    descripcion: "Consultar los datos de la propia organización",
  },
  {
    recurso: "organizaciones",
    accion: "actualizar",
    descripcion: "Actualizar los datos de la propia organización",
  },
  {
    recurso: "organizaciones",
    accion: "cambiarEstado",
    descripcion: "Activar/suspender/desactivar la propia organización",
  },
  { recurso: "contexto", accion: "leer", descripcion: "Consultar el Contexto ISO y su configuración" },
  { recurso: "contexto", accion: "crear", descripcion: "Crear un nuevo Contexto ISO" },
  {
    recurso: "contexto",
    accion: "actualizar",
    descripcion: "Actualizar alcance/criterios y configurar escalas/matriz de un Contexto ISO",
  },
  { recurso: "contexto", accion: "activar", descripcion: "Activar un Contexto ISO" },
  { recurso: "activos", accion: "leer", descripcion: "Consultar el inventario de activos" },
  { recurso: "activos", accion: "crear", descripcion: "Registrar un nuevo activo" },
  { recurso: "activos", accion: "actualizar", descripcion: "Actualizar datos de un activo" },
  {
    recurso: "activos",
    accion: "cambiarEstado",
    descripcion: "Activar/desactivar/retirar un activo",
  },
  { recurso: "amenazas", accion: "leer", descripcion: "Consultar el catálogo de amenazas" },
  { recurso: "amenazas", accion: "crear", descripcion: "Registrar una amenaza propia" },
  { recurso: "amenazas", accion: "actualizar", descripcion: "Actualizar una amenaza propia" },
  { recurso: "amenazas", accion: "eliminar", descripcion: "Eliminar una amenaza propia" },
];

const ROL_ADMINISTRADOR = {
  nombre: "Administrador",
  descripcion: "Rol protegido del sistema con acceso completo a administración",
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

async function main(): Promise<void> {
  // 1. Catálogo de permisos (idempotente vía upsert por la UK (recurso, accion))
  const permisosCreados = await Promise.all(
    PERMISOS.map((p) =>
      prisma.permiso.upsert({
        where: { recurso_accion: { recurso: p.recurso, accion: p.accion } },
        update: { descripcion: p.descripcion },
        create: p,
      })
    )
  );

  // 2. Rol protegido "Administrador" (esSistema = true)
  const rolAdministrador = await prisma.rol.upsert({
    where: { nombre: ROL_ADMINISTRADOR.nombre },
    update: {},
    create: { ...ROL_ADMINISTRADOR, esSistema: true },
  });

  // 3. Asignar todos los permisos al rol Administrador
  await Promise.all(
    permisosCreados.map((permiso) =>
      prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: { rolId: rolAdministrador.id, permisoId: permiso.id },
        },
        update: {},
        create: { rolId: rolAdministrador.id, permisoId: permiso.id },
      })
    )
  );

  // 4. Organización semilla (necesaria porque Usuario.organizacionId es obligatorio)
  const organizacionSeed = await prisma.organizacion.upsert({
    where: { nombre: ORGANIZACION_SEED.nombre },
    update: {},
    create: ORGANIZACION_SEED,
  });

  // 5. Primer usuario administrador — resuelve el arranque sin crear
  // entidades nuevas (SuperAdmin, Usuario maestro, etc.), usando únicamente
  // Usuario + Rol ya existentes.
  //
  // La contraseña inicial NO puede quedar escrita en el código: se exige
  // mediante la variable de entorno SEED_ADMIN_PASSWORD. Si no está
  // definida, esta parte del seed se detiene (el resto del seed — permisos,
  // rol Administrador, organización semilla — sí se completa).
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!seedAdminPassword) {
    // eslint-disable-next-line no-console
    console.log("Catálogo de permisos, rol Administrador y organización semilla completados.");
    // eslint-disable-next-line no-console
    console.log(
      "Usuario administrador inicial: Información pendiente de definición " +
        "(defina SEED_ADMIN_PASSWORD y vuelva a ejecutar `npm run prisma:seed` para crearlo)."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(seedAdminPassword, 10);

  await prisma.usuario.upsert({
    where: {
      organizacionId_email: {
        organizacionId: organizacionSeed.id,
        email: USUARIO_SEED.email,
      },
    },
    update: {},
    create: {
      organizacionId: organizacionSeed.id,
      rolId: rolAdministrador.id,
      nombre: USUARIO_SEED.nombre,
      email: USUARIO_SEED.email,
      passwordHash,
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed completado:");
  // eslint-disable-next-line no-console
  console.log(`  Organización: ${ORGANIZACION_SEED.nombre}`);
  // eslint-disable-next-line no-console
  console.log(`  Usuario:      ${USUARIO_SEED.email}`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Error ejecutando el seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
