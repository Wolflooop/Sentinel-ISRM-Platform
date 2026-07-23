import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ConteoPorEstadoControl } from "../types/dashboard.types";
import { useTheme } from "../../../lib/theme/ThemeProvider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ORDEN_ESTADOS: Array<keyof ConteoPorEstadoControl> = [
  "NO_INICIADO",
  "EN_PROGRESO",
  "IMPLEMENTADO",
  "VERIFICADO",
];
const ETIQUETAS: Record<keyof ConteoPorEstadoControl, string> = {
  NO_INICIADO: "No iniciado",
  EN_PROGRESO: "En progreso",
  IMPLEMENTADO: "Implementado",
  VERIFICADO: "Verificado",
};

interface ControlsStatusChartProps {
  controlesPorEstado: ConteoPorEstadoControl;
}

export function ControlsStatusChart({ controlesPorEstado }: ControlsStatusChartProps) {
  // <canvas> no hereda CSS ni las variables de tema: color de barra, texto
  // de ejes y rejilla necesitan un valor explícito según el tema activo.
  const { tema } = useTheme();
  const colorTexto = tema === "dark" ? "#e2e8f0" : "#334155";
  const colorRejilla = tema === "dark" ? "rgba(226,232,240,0.1)" : "rgba(51,65,85,0.08)";
  const colorBarra = tema === "dark" ? "#8b7ee0" : "#475569";

  const total = ORDEN_ESTADOS.reduce((suma, estado) => suma + controlesPorEstado[estado], 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-border bg-surface-elevated p-5">
        <p className="text-sm text-muted">No hay controles registrados todavía.</p>
      </div>
    );
  }

  const data = {
    labels: ORDEN_ESTADOS.map((estado) => ETIQUETAS[estado]),
    datasets: [
      {
        data: ORDEN_ESTADOS.map((estado) => controlesPorEstado[estado]),
        backgroundColor: colorBarra,
        borderRadius: 4,
        maxBarThickness: 48,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5 shadow-sm">
      <h2 className="text-sm font-medium text-ink">Controles por estado</h2>
      <div className="mt-4 h-56">
        <Bar
          data={data}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, font: { size: 12 }, color: colorTexto },
                grid: { color: colorRejilla },
              },
              x: {
                ticks: { font: { size: 11 }, color: colorTexto },
                grid: { color: colorRejilla },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
