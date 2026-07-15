import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { AppError } from "../../../shared/AppError";
import {
  crearReporte,
  findReportePorId,
  findReportes,
  recopilarDatosOrganizacion,
  registrarAuditoriaReporte,
} from "../repository/reports.repository";
import { GenerarReporteInput } from "../schema/reports.schema";
import {
  DatosReporteOrganizacion,
  FiltrosReportes,
  ReporteConRelaciones,
} from "../types/reports.types";

interface ActorAuditoria {
  usuarioId: string;
  organizacionId: string;
  direccionIp: string;
}

// Carpeta física donde se guardan los archivos generados. No se sirve
// como directorio estático: la descarga siempre pasa por el endpoint
// autenticado (ver reports.controller.ts) para respetar RBAC por
// organización.
const STORAGE_DIR = path.resolve(__dirname, "../../../../storage/reports");

function asegurarDirectorioStorage(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

const TITULOS_TIPO: Record<string, string> = {
  EJECUTIVO: "Reporte Ejecutivo",
  TECNICO: "Reporte Técnico",
  GENERAL: "Reporte General",
};

/**
 * Solo PDF está implementado en esta fase (prioridad explícita del
 * backlog). XLSX/CSV quedan con la arquitectura lista (mismo
 * repository/service) pero sin implementación de render todavía: se
 * rechazan explícitamente en vez de fingir soporte.
 */
function validarFormatoSoportado(formato: string): void {
  if (formato !== "PDF") {
    throw new AppError(
      `El formato ${formato} aún no está implementado. Actualmente solo se soporta PDF.`,
      501
    );
  }
}

function dibujarEncabezado(
  doc: PDFKit.PDFDocument,
  tipo: string,
  datos: DatosReporteOrganizacion
): void {
  doc
    .fontSize(18)
    .fillColor("#443E99")
    .text(TITULOS_TIPO[tipo] ?? "Reporte", { align: "left" })
    .moveDown(0.3);

  doc
    .fontSize(10)
    .fillColor("#353B4D")
    .text(`Organización: ${datos.organizacion.nombre}`)
    .text(`Sector: ${datos.organizacion.sector} · Tamaño: ${datos.organizacion.tamano} · País: ${datos.organizacion.paisIso}`)
    .text(`Generado el: ${datos.generadoEn.toLocaleString("es-CO")}`)
    .moveDown(1);

  doc
    .strokeColor("#443E99")
    .moveTo(doc.x, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke()
    .moveDown(0.8);
}

function dibujarSeccionTitulo(doc: PDFKit.PDFDocument, titulo: string): void {
  if (doc.y > doc.page.height - doc.page.margins.bottom - 60) {
    doc.addPage();
  }
  doc.fontSize(13).fillColor("#443E99").text(titulo).moveDown(0.4);
}

function dibujarTabla(
  doc: PDFKit.PDFDocument,
  encabezados: string[],
  filas: string[][],
  anchos: number[]
): void {
  const inicioX = doc.page.margins.left;
  doc.fontSize(9).fillColor("#353B4D");

  const escribirFila = (celdas: string[], negrita: boolean) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - 30) {
      doc.addPage();
    }
    let x = inicioX;
    const yInicio = doc.y;
    celdas.forEach((celda, i) => {
      doc.font(negrita ? "Helvetica-Bold" : "Helvetica").text(celda, x, yInicio, {
        width: anchos[i],
        continued: false,
      });
      x += anchos[i];
    });
    doc.moveDown(0.3);
  };

  escribirFila(encabezados, true);
  doc
    .strokeColor("#E0DDEB")
    .moveTo(inicioX, doc.y)
    .lineTo(inicioX + anchos.reduce((a, b) => a + b, 0), doc.y)
    .stroke()
    .moveDown(0.2);

  if (filas.length === 0) {
    doc.font("Helvetica").fillColor("#8A8698").text("Sin registros.").moveDown(0.5);
    return;
  }

  filas.forEach((fila) => escribirFila(fila, false));
  doc.moveDown(0.5);
}

function construirPDF(
  tipo: string,
  datos: DatosReporteOrganizacion,
  rutaDestino: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const stream = fs.createWriteStream(rutaDestino);
    doc.pipe(stream);

    dibujarEncabezado(doc, tipo, datos);

    // Sección de activos: presente en todos los tipos de reporte.
    dibujarSeccionTitulo(doc, `Activos registrados (${datos.activos.length})`);
    dibujarTabla(
      doc,
      ["Nombre", "Categoría", "Criticidad", "Estado"],
      datos.activos.map((a) => [a.nombre, a.categoria, String(a.criticidad), a.estado]),
      [180, 150, 70, 90]
    );

    // Sección de riesgos: detalle técnico en TECNICO/GENERAL, resumen en EJECUTIVO.
    dibujarSeccionTitulo(doc, `Riesgos evaluados (${datos.riesgos.length})`);
    if (tipo === "EJECUTIVO") {
      dibujarTabla(
        doc,
        ["Activo", "Nivel inherente", "Nivel residual", "Valor"],
        datos.riesgos.map((r) => [
          r.activo,
          r.nivelInherente,
          r.nivelResidual ?? "Sin tratar",
          String(r.valorRiesgo),
        ]),
        [200, 120, 120, 50]
      );
    } else {
      dibujarTabla(
        doc,
        ["Activo", "Amenaza", "Vulnerabilidad", "P", "I", "Valor", "Nivel"],
        datos.riesgos.map((r) => [
          r.activo,
          r.amenaza,
          r.vulnerabilidad,
          String(r.probabilidad),
          String(r.impacto),
          String(r.valorRiesgo),
          r.nivelInherente,
        ]),
        [110, 100, 100, 25, 25, 45, 65]
      );
    }

    // Matriz de riesgos: solo en TECNICO/GENERAL.
    if (tipo !== "EJECUTIVO") {
      dibujarSeccionTitulo(doc, "Matriz de riesgos");
      if (datos.matriz) {
        dibujarTabla(
          doc,
          ["Probabilidad", "Impacto", "Nivel resultante"],
          datos.matriz.celdas.map((c) => [
            String(c.probabilidad),
            String(c.impacto),
            c.nivel,
          ]),
          [150, 150, 150]
        );
      } else {
        doc.fontSize(9).fillColor("#8A8698").text("No hay un Contexto ISO activo con matriz configurada.").moveDown(0.5);
      }
    }

    // Controles: presente en todos los tipos de reporte.
    dibujarSeccionTitulo(doc, `Controles de seguridad (${datos.controles.length})`);
    dibujarTabla(
      doc,
      ["Nombre", "Código ISO 27001", "Tipo", "Estado"],
      datos.controles.map((c) => [
        c.nombre,
        c.codigoIso27001 ?? "—",
        c.tipo,
        c.estadoImplementacion,
      ]),
      [190, 110, 100, 90]
    );

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

export async function generarReporteNuevo(
  input: GenerarReporteInput,
  actor: ActorAuditoria
): Promise<ReporteConRelaciones> {
  validarFormatoSoportado(input.formato);
  asegurarDirectorioStorage();

  const datos = await recopilarDatosOrganizacion(actor.organizacionId);

  const nombreArchivo = `${actor.organizacionId}_${input.tipo}_${Date.now()}.pdf`;
  const rutaAbsoluta = path.join(STORAGE_DIR, nombreArchivo);

  await construirPDF(input.tipo, datos, rutaAbsoluta);

  const reporte = await crearReporte({
    organizacionId: actor.organizacionId,
    usuarioId: actor.usuarioId,
    tipo: input.tipo,
    formato: "PDF",
    rutaArchivo: nombreArchivo,
  });

  await registrarAuditoriaReporte({
    usuarioId: actor.usuarioId,
    organizacionId: actor.organizacionId,
    entidadId: reporte.id,
    direccionIp: actor.direccionIp,
    datosNuevos: { tipo: reporte.tipo, formato: reporte.formato },
  });

  return reporte;
}

export async function listarReportesDeOrganizacion(
  filtros: FiltrosReportes
): Promise<ReporteConRelaciones[]> {
  return findReportes(filtros);
}

export async function obtenerRutaDescarga(
  id: string,
  organizacionId: string
): Promise<{ rutaAbsoluta: string; nombreDescarga: string }> {
  const reporte = await findReportePorId(id);
  if (!reporte) {
    throw new AppError("Reporte no encontrado", 404);
  }
  // Aislamiento por organización: un reporte de otra organización jamás
  // es accesible, aunque el id sea válido.
  if (reporte.organizacionId !== organizacionId) {
    throw new AppError("Reporte no encontrado", 404);
  }

  const rutaAbsoluta = path.join(STORAGE_DIR, reporte.rutaArchivo);
  if (!fs.existsSync(rutaAbsoluta)) {
    throw new AppError("El archivo del reporte ya no está disponible en el servidor", 410);
  }

  return {
    rutaAbsoluta,
    nombreDescarga: `sentinel-isrm_${reporte.tipo.toLowerCase()}_${reporte.fecha.toISOString().slice(0, 10)}.pdf`,
  };
}
