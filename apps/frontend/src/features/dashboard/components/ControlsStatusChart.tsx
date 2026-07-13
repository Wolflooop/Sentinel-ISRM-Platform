import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ConteoPorEstadoControl } from "../types/dashboard.types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ORDEN_ESTADOS: Array<keyof ConteoPorEstadoControl> = [
  "NO_APLICADO",
  "PLANIFICADO",
  "EN_PROGRESO",
  "IMPLEMENTADO",
];
const ETIQUETAS: Record<keyof ConteoPorEstadoControl, string> = {
  NO_APLICADO: "No aplicado",
  PLANIFICADO: "Planificado",
  EN_PROGRESO: "En progreso",
  IMPLEMENTADO: "Implementado",
};

interface ControlsStatusChartProps {
  controlesPorEstado: ConteoPorEstadoControl;
}

export function ControlsStatusChart({ controlesPorEstado }: ControlsStatusChartProps) {
  const total = ORDEN_ESTADOS.reduce((suma, estado) => suma + controlesPorEstado[estado], 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">No hay controles registrados todavía.</p>
      </div>
    );
  }

  const data = {
    labels: ORDEN_ESTADOS.map((estado) => ETIQUETAS[estado]),
    datasets: [
      {
        data: ORDEN_ESTADOS.map((estado) => controlesPorEstado[estado]),
        backgroundColor: "#475569",
        borderRadius: 4,
        maxBarThickness: 48,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-medium text-slate-700">Controles por estado</h2>
      <div className="mt-4 h-56">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 12 } } },
              x: { ticks: { font: { size: 11 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
