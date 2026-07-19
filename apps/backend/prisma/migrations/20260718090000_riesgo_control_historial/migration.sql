-- Fase 9: trazabilidad histórica de Riesgo y Control (UX + historial).
--
-- Estas tablas no reemplazan ni modifican ninguna tabla existente: son
-- puramente aditivas. Cada fila representa un cambio real de estado ya
-- ocurrido (creación, evaluación, tratamiento, actualización de control);
-- no existe ningún endpoint nuevo de "cambiar estado libremente" — la
-- capa de aplicación sigue siendo la única que decide cuándo se inserta
-- una fila aquí (ver evaluations.service.ts, treatments.service.ts,
-- controls.service.ts).

-- CreateTable
CREATE TABLE "RiesgoHistorial" (
    "id" TEXT NOT NULL,
    "riesgoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estadoAnterior" "EstadoRiesgo",
    "estadoNuevo" "EstadoRiesgo" NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiesgoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlHistorial" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estadoAnterior" "EstadoImplementacionControl",
    "estadoNuevo" "EstadoImplementacionControl" NOT NULL,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ControlHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiesgoHistorial_riesgoId_createdAt_idx" ON "RiesgoHistorial"("riesgoId", "createdAt");

-- CreateIndex
CREATE INDEX "ControlHistorial_controlId_createdAt_idx" ON "ControlHistorial"("controlId", "createdAt");

-- AddForeignKey
ALTER TABLE "RiesgoHistorial" ADD CONSTRAINT "RiesgoHistorial_riesgoId_fkey" FOREIGN KEY ("riesgoId") REFERENCES "Riesgo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiesgoHistorial" ADD CONSTRAINT "RiesgoHistorial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlHistorial" ADD CONSTRAINT "ControlHistorial_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlHistorial" ADD CONSTRAINT "ControlHistorial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
