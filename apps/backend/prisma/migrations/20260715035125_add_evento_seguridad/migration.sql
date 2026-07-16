-- Fase 3: Security Events — trazabilidad de eventos de autenticación/sesión.
-- Modelo separado de "Auditoria" (ver comentarios en schema.prisma).

-- CreateEnum
CREATE TYPE "TipoEventoSeguridad" AS ENUM (
  'AUTH_LOGIN_SUCCESS',
  'AUTH_LOGIN_FAILED',
  'AUTH_LOGOUT',
  'AUTH_SESSION_EXPIRED',
  'AUTH_ACCESS_DENIED'
);

-- CreateEnum
CREATE TYPE "ResultadoEventoSeguridad" AS ENUM (
  'EXITO',
  'FALLIDO'
);

-- CreateEnum
CREATE TYPE "SeveridadEventoSeguridad" AS ENUM (
  'INFO',
  'ADVERTENCIA',
  'ALTA',
  'CRITICA'
);

-- CreateTable
CREATE TABLE "EventoSeguridad" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "organizacionId" TEXT,
    "evento" "TipoEventoSeguridad" NOT NULL,
    "resultado" "ResultadoEventoSeguridad" NOT NULL,
    "severidad" "SeveridadEventoSeguridad" NOT NULL,
    "direccionIp" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "detalles" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoSeguridad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoSeguridad_usuarioId_idx" ON "EventoSeguridad"("usuarioId");

-- CreateIndex
CREATE INDEX "EventoSeguridad_organizacionId_idx" ON "EventoSeguridad"("organizacionId");

-- CreateIndex
CREATE INDEX "EventoSeguridad_evento_idx" ON "EventoSeguridad"("evento");

-- CreateIndex
CREATE INDEX "EventoSeguridad_fecha_idx" ON "EventoSeguridad"("fecha");

-- CreateIndex
CREATE INDEX "EventoSeguridad_severidad_idx" ON "EventoSeguridad"("severidad");

-- AddForeignKey
ALTER TABLE "EventoSeguridad" ADD CONSTRAINT "EventoSeguridad_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoSeguridad" ADD CONSTRAINT "EventoSeguridad_organizacionId_fkey"
  FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
