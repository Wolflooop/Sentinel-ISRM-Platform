import { Fragment, ReactNode } from "react";
import { NivelRiesgo } from "../features/context/types/context.types";

/**
 * Presentación visual única y reutilizable de la matriz de riesgo 5x5
 * (probabilidad × impacto). La usan tanto MatrizEditor.tsx (configuración,
 * dentro de Contexto ISO) como RiskMatrixGrid.tsx (visualización de solo
 * lectura, dentro de Gestión de Riesgos) para que ambas pantallas se vean
 * exactamente igual, tal como se pidió. Este componente NO decide la
 * lógica de negocio (qué nivel corresponde a cada celda, cómo se cuentan
 * los riesgos, cómo se guarda un cambio): solo dibuja ejes, celdas y
 * colores; el contenido de cada celda y el comportamiento al hacer click
 * los define quien lo use, vía props.
 */

// Fase A: filas = probabilidad (5 arriba .. 1 abajo), columnas = impacto
// (1 .. 5 de izquierda a derecha). No se reordena ni reinterpreta: es la
// misma convención que ya usaban MatrizEditor.tsx y RiskMatrixGrid.tsx.
export const NIVELES_PROBABILIDAD_EJE = [5, 4, 3, 2, 1];
export const NIVELES_IMPACTO_EJE = [1, 2, 3, 4, 5];

export const COLOR_POR_NIVEL: Record<NivelRiesgo, string> = {
  BAJO: "border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300",
  MEDIO:
    "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  ALTO: "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  CRITICO: "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export const ETIQUETA_NIVEL: Record<NivelRiesgo, string> = {
  BAJO: "Bajo",
  MEDIO: "Medio",
  ALTO: "Alto",
  CRITICO: "Crítico",
};

const CLASE_SIN_DEFINIR = "border-dashed border-border bg-surface text-muted";

interface RiskMatrixVisualProps {
  /** Nivel guardado para la combinación probabilidad×impacto, o null si aún no está clasificada. */
  obtenerNivel: (probabilidad: number, impacto: number) => NivelRiesgo | null;
  /** Contenido a pintar dentro de cada celda (etiqueta, conteo, lo que aplique en cada pantalla). */
  renderContenido: (probabilidad: number, impacto: number, nivel: NivelRiesgo | null) => ReactNode;
  /** Si se provee, las celdas son clickeables (usado por el editor); si no, la matriz es de solo lectura. */
  onCeldaClick?: (probabilidad: number, impacto: number) => void;
  /** Texto de tooltip/título para el eje de probabilidad (usa la etiqueta configurada por la organización). */
  tituloProbabilidad?: (nivel: number) => string;
  /** Texto de tooltip/título para el eje de impacto. */
  tituloImpacto?: (nivel: number) => string;
  /** Celda actualmente resaltada (p. ej. la que se está editando). */
  celdaResaltada?: { probabilidad: number; impacto: number } | null;
}

export function RiskMatrixVisual({
  obtenerNivel,
  renderContenido,
  onCeldaClick,
  tituloProbabilidad,
  tituloImpacto,
  celdaResaltada,
}: RiskMatrixVisualProps) {
  const esInteractiva = !!onCeldaClick;

  return (
    <div className="overflow-x-auto">
      {/* Grid con columna fija para el eje de probabilidad + 5 columnas de
          impacto de ancho idéntico, para que encabezados y celdas queden
          siempre alineados. */}
      <div className="inline-grid grid-cols-[3.5rem_repeat(5,5.5rem)] gap-2">
        {/* Encabezado superior: "Impacto →" centrado sobre las 5 columnas. */}
        <div />
        <div className="col-span-5 pb-1 text-center text-xs font-semibold uppercase tracking-wide text-muted">
          Impacto →
        </div>

        {/* Números de columna 1..5. */}
        <div />
        {NIVELES_IMPACTO_EJE.map((impacto) => (
          <div
            key={`num-impacto-${impacto}`}
            className="pb-2 text-center text-sm font-semibold text-ink"
            title={tituloImpacto?.(impacto)}
          >
            {impacto}
          </div>
        ))}

        {/* Filas: probabilidad 5..1. En la primera fila se ancla además el
            rótulo vertical "Probabilidad ↑". */}
        {NIVELES_PROBABILIDAD_EJE.map((probabilidad, filaIndex) => (
          <Fragment key={`fila-${probabilidad}`}>
            <div className="flex flex-col items-end justify-center pr-1 text-right">
              {filaIndex === 0 && (
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  Probabilidad ↑
                </span>
              )}
              <span
                className="text-sm font-semibold text-ink"
                title={tituloProbabilidad?.(probabilidad)}
              >
                {probabilidad}
              </span>
            </div>

            {NIVELES_IMPACTO_EJE.map((impacto) => {
              const nivel = obtenerNivel(probabilidad, impacto);
              const resaltada =
                celdaResaltada?.probabilidad === probabilidad && celdaResaltada?.impacto === impacto;
              const tituloCombinacion =
                nivel && tituloProbabilidad && tituloImpacto
                  ? `${tituloProbabilidad(probabilidad)} × ${tituloImpacto(impacto)} → ${ETIQUETA_NIVEL[nivel]}`
                  : "Sin clasificar";

              return (
                <div
                  key={`celda-${probabilidad}-${impacto}`}
                  role={esInteractiva ? "button" : undefined}
                  tabIndex={esInteractiva ? 0 : undefined}
                  onClick={esInteractiva ? () => onCeldaClick?.(probabilidad, impacto) : undefined}
                  onKeyDown={
                    esInteractiva
                      ? (evento) => {
                          if (evento.key === "Enter" || evento.key === " ") {
                            evento.preventDefault();
                            onCeldaClick?.(probabilidad, impacto);
                          }
                        }
                      : undefined
                  }
                  title={tituloCombinacion}
                  aria-label={`Probabilidad ${probabilidad}, impacto ${impacto}: ${tituloCombinacion}`}
                  className={`flex h-20 w-[5.5rem] flex-col items-center justify-center gap-0.5 rounded-lg border px-1 text-center transition-shadow ${
                    nivel ? COLOR_POR_NIVEL[nivel] : CLASE_SIN_DEFINIR
                  } ${esInteractiva ? "cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary" : ""} ${
                    resaltada ? "ring-2 ring-primary ring-offset-1 ring-offset-surface" : ""
                  }`}
                >
                  {renderContenido(probabilidad, impacto, nivel)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
