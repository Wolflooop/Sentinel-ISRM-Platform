import multer from "multer";
import path from "path";
import fs from "fs";

// V2 (punto 12 del prompt): almacenamiento local de archivos de Evidencia.
// Mismo criterio que modules/reports/service/reports.service.ts: la ruta
// absoluta se resuelve en el servidor de archivos; en base de datos
// (Evidencia.rutaArchivo) solo se persiste el nombre generado.
const STORAGE_DIR = path.resolve(__dirname, "../../storage/evidencias");

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, STORAGE_DIR),
  filename: (_req, file, cb) => {
    const sufijo = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${sufijo}${extension}`);
  },
});

const LIMITE_TAMANO_BYTES = 20 * 1024 * 1024; // 20 MB

export const uploadEvidencia = multer({
  storage,
  limits: { fileSize: LIMITE_TAMANO_BYTES },
}).single("archivo");

export function rutaAbsolutaEvidencia(nombreArchivoAlmacenado: string): string {
  return path.join(STORAGE_DIR, nombreArchivoAlmacenado);
}
