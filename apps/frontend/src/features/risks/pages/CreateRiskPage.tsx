import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { RiskForm } from "../components/RiskForm";
import { useCrearRiesgo } from "../hooks/useRisks";

export function CreateRiskPage() {
  const navigate = useNavigate();
  const crearRiesgo = useCrearRiesgo();

  const errorMessage = isAxiosError(crearRiesgo.error)
    ? (crearRiesgo.error.response?.data as { error?: string } | undefined)?.error ??
      "No se pudo registrar el riesgo"
    : crearRiesgo.error
    ? "No se pudo registrar el riesgo"
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-slate-800">Nuevo riesgo</h1>
      <div className="mt-6">
        <RiskForm
          isSubmittingRequest={crearRiesgo.isPending}
          errorMessage={errorMessage}
          onSubmit={(values) => {
            crearRiesgo.mutate(values, {
              onSuccess: (riesgo) => navigate(`/riesgos/${riesgo.id}`, { replace: true }),
            });
          }}
        />
      </div>
    </main>
  );
}
