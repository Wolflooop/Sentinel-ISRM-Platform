import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { TipoRol } from "@prisma/client";
import { AppError } from "../../../shared/AppError";
import {
  crearReporteConAuditoria,
  findReportePorId,
  findReportes,
  recopilarDatosOrganizacion,
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
  tipoRol: TipoRol;
}

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

const COLORES_NIVEL_RIESGO: Record<string, string> = {
  BAJO: "#2E7D32",
  MEDIO: "#F2A93B",
  ALTO: "#E2793D",
  CRITICO: "#C0392B",
};

const ORDEN_NIVEL_RIESGO = ["BAJO", "MEDIO", "ALTO", "CRITICO"];
const ETIQUETA_NIVEL_RIESGO: Record<string, string> = {
  BAJO: "Bajo",
  MEDIO: "Medio",
  ALTO: "Alto",
  CRITICO: "Crítico",
};

// Agrupación de presentación para el gráfico: no altera el estado real
// guardado, solo lo agrupa en 3 categorías visuales pedidas por el
// backlog. V2: IMPLEMENTADO y VERIFICADO se muestran juntos como
// "Implementado" (VERIFICADO es un refuerzo posterior del mismo estado
// operativo, no una categoría visual distinta en este reporte).
const CATEGORIA_ESTADO_CONTROL: Record<string, string> = {
  IMPLEMENTADO: "Implementado",
  VERIFICADO: "Implementado",
  EN_PROGRESO: "Pendiente",
  NO_INICIADO: "No aplicado",
};

const ORDEN_CATEGORIA_CONTROL = ["Implementado", "Pendiente", "No aplicado"];
const COLOR_CATEGORIA_CONTROL: Record<string, string> = {
  Implementado: "#2E7D32",
  Pendiente: "#F2A93B",
  "No aplicado": "#8A8698",
};

/**
 * Dibuja un gráfico de barras verticales simple usando primitivas de
 * pdfkit (rect/text/stroke). No depende de ninguna librería de charting:
 * mismo enfoque vectorial que ya usa dibujarTabla más abajo.
 */
function dibujarGraficoBarras(
  doc: PDFKit.PDFDocument,
  datos: Array<{ etiqueta: string; valor: number; color: string }>
): void {
  const anchoDisponible = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const altoGrafico = 110;
  const anchoBarra = 46;
  const espacio = (anchoDisponible - anchoBarra * datos.length) / (datos.length + 1);
  const xBase = doc.page.margins.left;
  const yBase = doc.y + altoGrafico;
  const valorMaximo = Math.max(1, ...datos.map((d) => d.valor));

  if (yBase + 30 > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }

  const yBaseFinal = doc.y + altoGrafico;

  // Línea base del eje
  doc
    .strokeColor("#E0DDEB")
    .moveTo(xBase, yBaseFinal)
    .lineTo(xBase + anchoDisponible, yBaseFinal)
    .stroke();

  datos.forEach((d, i) => {
    const x = xBase + espacio * (i + 1) + anchoBarra * i;
    const alturaBarra = valorMaximo === 0 ? 0 : (d.valor / valorMaximo) * (altoGrafico - 20);
    const y = yBaseFinal - alturaBarra;

    doc.rect(x, y, anchoBarra, alturaBarra).fill(d.color);

    doc
      .fontSize(9)
      .fillColor("#353B4D")
      .text(String(d.valor), x, y - 12, { width: anchoBarra, align: "center" });

    doc
      .fontSize(8)
      .fillColor("#353B4D")
      .text(d.etiqueta, x - 5, yBaseFinal + 4, { width: anchoBarra + 10, align: "center" });
  });

  doc.x = xBase;
  doc.y = yBaseFinal + 20;
}

function dibujarGraficoDistribucionRiesgos(
  doc: PDFKit.PDFDocument,
  datos: DatosReporteOrganizacion
): void {
  dibujarSeccionTitulo(doc, "Distribución de riesgos por nivel");

  const conteos: Record<string, number> = { BAJO: 0, MEDIO: 0, ALTO: 0, CRITICO: 0 };
  datos.riesgos.forEach((r) => {
    if (conteos[r.nivelInherente] !== undefined) {
      conteos[r.nivelInherente] += 1;
    }
  });

  if (datos.riesgos.length === 0) {
    doc.fontSize(9).fillColor("#8A8698").text("Sin riesgos registrados para graficar.").moveDown(0.5);
    return;
  }

  dibujarGraficoBarras(
    doc,
    ORDEN_NIVEL_RIESGO.map((nivel) => ({
      etiqueta: ETIQUETA_NIVEL_RIESGO[nivel],
      valor: conteos[nivel],
      color: COLORES_NIVEL_RIESGO[nivel],
    }))
  );
}

function dibujarGraficoEstadoControles(
  doc: PDFKit.PDFDocument,
  datos: DatosReporteOrganizacion
): void {
  dibujarSeccionTitulo(doc, "Estado de implementación de controles");

  const conteos: Record<string, number> = { Implementado: 0, Pendiente: 0, "No aplicado": 0 };
  datos.controles.forEach((c) => {
    const categoria = CATEGORIA_ESTADO_CONTROL[c.estadoImplementacion];
    if (categoria) {
      conteos[categoria] += 1;
    }
  });

  if (datos.controles.length === 0) {
    doc.fontSize(9).fillColor("#8A8698").text("Sin controles registrados para graficar.").moveDown(0.5);
    return;
  }

  dibujarGraficoBarras(
    doc,
    ORDEN_CATEGORIA_CONTROL.map((categoria) => ({
      etiqueta: categoria,
      valor: conteos[categoria],
      color: COLOR_CATEGORIA_CONTROL[categoria],
    }))
  );
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
          r.amenaza ?? "—",
          r.vulnerabilidad ?? "—",
          String(r.probabilidad),
          String(r.impacto),
          String(r.valorRiesgo),
          r.nivelInherente,
        ]),
        [110, 100, 100, 25, 25, 45, 65]
      );
    }

    dibujarGraficoDistribucionRiesgos(doc, datos);

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

    dibujarGraficoEstadoControles(doc, datos);

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

  const datos = await recopilarDatosOrganizacion(actor.organizacionId, {
    tipoRol: actor.tipoRol,
    usuarioId: actor.usuarioId,
  });

  const nombreArchivo = `${actor.organizacionId}_${input.tipo}_${Date.now()}.pdf`;
  const rutaAbsoluta = path.join(STORAGE_DIR, nombreArchivo);

  await construirPDF(input.tipo, datos, rutaAbsoluta);

  const reporte = await crearReporteConAuditoria(
    {
      organizacionId: actor.organizacionId,
      usuarioId: actor.usuarioId,
      tipo: input.tipo,
      formato: "PDF",
      rutaArchivo: nombreArchivo,
    },
    {
      usuarioId: actor.usuarioId,
      organizacionId: actor.organizacionId,
      direccionIp: actor.direccionIp,
      datosNuevos: { tipo: input.tipo, formato: "PDF" },
    }
  );

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
