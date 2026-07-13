import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ConteoPorNivel } from "../types/dashboard.types";

ChartJS.register(ArcElement, Tooltip, Legend);

const ORDEN_NIVELES: Array<keyof ConteoPorNivel> = ["BAJO", "MEDIO", "ALTO", "CRITICO"];
const ETIQUETAS: Record<keyof ConteoPorNivel, string> = {
  BAJO: "Bajo",
  MEDIO: "Medio",
  ALTO: "Alto",
  CRITICO: "Crítico",
};
const COLORES: Record<keyof ConteoPorNivel, string> = {
  BAJO: "#16a34a",
  MEDIO: "#eab308",
  ALTO: "#f97316",
  CRITICO: "#dc2626",
};

interface RiskLevelChartProps {
  riesgosPorNivel: ConteoPorNivel;
}

export function RiskLevelChart({ riesgosPorNivel }: RiskLevelChartProps) {
  const total = ORDEN_NIVELES.reduce((suma, nivel) => suma + riesgosPorNivel[nivel], 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">No hay riesgos registrados todavía.</p>
      </div>
    );
  }

  const data = {
    labels: ORDEN_NIVELES.map((nivel) => ETIQUETAS[nivel]),
    datasets: [
      {
        data: ORDEN_NIVELES.map((nivel) => riesgosPorNivel[nivel]),
        backgroundColor: ORDEN_NIVELES.map((nivel) => COLORES[nivel]),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-medium text-slate-700">Distribución de riesgos por nivel</h2>
      <div className="mx-auto mt-4 h-56">
        <Doughnut
          data={data}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 12 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
