import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ConteoPorTipoRol } from "../types/dashboard.types";
import { useTheme } from "../../../lib/theme/ThemeProvider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ORDEN_TIPOS: Array<keyof ConteoPorTipoRol> = ["SUPER_ADMIN", "ADMIN_TIC", "USUARIO_COMUN"];
const ETIQUETAS: Record<keyof ConteoPorTipoRol, string> = {
  SUPER_ADMIN: "Administrador Principal",
  ADMIN_TIC: "Administrador TIC",
  USUARIO_COMUN: "Usuario Operativo",
};

interface UsersByRoleChartProps {
  usuariosPorTipoRol: ConteoPorTipoRol;
}

export function UsersByRoleChart({ usuariosPorTipoRol }: UsersByRoleChartProps) {
  const { tema } = useTheme();
  const colorTexto = tema === "dark" ? "#e2e8f0" : "#334155";
  const colorRejilla = tema === "dark" ? "rgba(226,232,240,0.1)" : "rgba(51,65,85,0.08)";
  const colorBarra = tema === "dark" ? "#8b7ee0" : "#475569";

  const total = ORDEN_TIPOS.reduce((suma, tipo) => suma + usuariosPorTipoRol[tipo], 0);

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-border bg-surface-elevated p-5">
        <p className="text-sm text-muted">No hay usuarios registrados todavía.</p>
      </div>
    );
  }

  const data = {
    labels: ORDEN_TIPOS.map((tipo) => ETIQUETAS[tipo]),
    datasets: [
      {
        data: ORDEN_TIPOS.map((tipo) => usuariosPorTipoRol[tipo]),
        backgroundColor: colorBarra,
        borderRadius: 4,
        maxBarThickness: 48,
      },
    ],
  };

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5 shadow-sm">
      <h2 className="text-sm font-medium text-ink">Usuarios por tipo de rol</h2>
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
