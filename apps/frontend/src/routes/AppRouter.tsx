import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AppShell } from "../features/shell/components/AppShell";
import { UsersListPage } from "../features/users/pages/UsersListPage";
import { CreateUserPage } from "../features/users/pages/CreateUserPage";
import { EditUserPage } from "../features/users/pages/EditUserPage";
import { OrganizationSettingsPage } from "../features/organizations/pages/OrganizationSettingsPage";
import { OrganizationsListPage } from "../features/organizations/pages/OrganizationsListPage";
import { ContextListPage } from "../features/context/pages/ContextListPage";
import { CreateContextPage } from "../features/context/pages/CreateContextPage";
import { ContextDetailPage } from "../features/context/pages/ContextDetailPage";
import { AssetsListPage } from "../features/assets/pages/AssetsListPage";
import { CreateAssetPage } from "../features/assets/pages/CreateAssetPage";
import { EditAssetPage } from "../features/assets/pages/EditAssetPage";
import { ThreatsListPage } from "../features/threats/pages/ThreatsListPage";
import { CreateThreatPage } from "../features/threats/pages/CreateThreatPage";
import { EditThreatPage } from "../features/threats/pages/EditThreatPage";
import { VulnerabilitiesListPage } from "../features/vulnerabilities/pages/VulnerabilitiesListPage";
import { RisksListPage } from "../features/risks/pages/RisksListPage";
import { CreateRiskPage } from "../features/risks/pages/CreateRiskPage";
import { RiskDetailPage } from "../features/risks/pages/RiskDetailPage";
import { EvaluationCreatePage } from "../features/evaluations/pages/EvaluationCreatePage";
import { EvaluationHistoryPage } from "../features/evaluations/pages/EvaluationHistoryPage";
import { CreateVulnerabilityPage } from "../features/vulnerabilities/pages/CreateVulnerabilityPage";
import { EditVulnerabilityPage } from "../features/vulnerabilities/pages/EditVulnerabilityPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { RiskMatrixPage } from "../features/risk-matrix/pages/RiskMatrixPage";
import { ControlsListPage } from "../features/controls/pages/ControlsListPage";
import { ControlDetailPage } from "../features/controls/pages/ControlDetailPage";
import { CreateControlPage } from "../features/controls/pages/CreateControlPage";
import { EditControlPage } from "../features/controls/pages/EditControlPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { AuditListPage } from "../features/audit/pages/AuditListPage";
import { SecurityEventsListPage } from "../features/security-events/pages/SecurityEventsListPage";
import { TreatmentCreatePage } from "../features/treatments/pages/TreatmentCreatePage";
import { TreatmentDetailPage } from "../features/treatments/pages/TreatmentDetailPage";
import { hasValidSession } from "../lib/authSession";
import { ProtectedRoute } from "./ProtectedRoute";
import { RequierePermiso } from "./RequierePermiso";
import { RequiereTipoRol } from "./RequiereTipoRol";
import { RequiereOrganizacion } from "./RequiereOrganizacion";
import { AccesoRestringidoPage } from "../features/shell/pages/AccesoRestringidoPage";



const HOME_ROUTE = "/dashboard"; 


function RootRedirect() {
  return hasValidSession()
    ? <Navigate to={HOME_ROUTE} replace />
    : <Navigate to="/login" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/acceso-restringido" element={<AccesoRestringidoPage />} />

          <Route element={<RequierePermiso recurso="usuarios" accion="leer" />}>
            <Route path="/usuarios" element={<UsersListPage />} />
            <Route path="/usuarios/nuevo" element={<CreateUserPage />} />
            <Route path="/usuarios/:id/editar" element={<EditUserPage />} />
          </Route>


          <Route element={<RequierePermiso recurso="organizaciones" accion="leer" />}>
            <Route path="/organizacion" element={<OrganizationSettingsPage />} />
          </Route>

          {/* Administración global de organizaciones — exclusiva del
              Administrador Principal (SUPER_ADMIN). Doble barrera: además
              del permiso "organizaciones:leer", exige el TipoRol correcto,
              tal como el backend (requireTipoRol("SUPER_ADMIN")). */}
          <Route element={<RequierePermiso recurso="organizaciones" accion="leer" />}>
            <Route element={<RequiereTipoRol tipoRol="SUPER_ADMIN" />}>
              <Route path="/organizaciones" element={<OrganizationsListPage />} />
            </Route>
          </Route>

          {/* Módulos organizacionales: además del permiso de recurso,
              exigen que el usuario pertenezca a una organización. El
              SUPER_ADMIN tiene el permiso (recibe todo el catálogo por
              diseño del RBAC) pero no pertenece a ninguna organización,
              así que este guard adicional lo redirige antes de llegar a
              una pantalla que el backend igualmente rechazaría. */}
          <Route element={<RequiereOrganizacion />}>
            <Route element={<RequierePermiso recurso="contexto" accion="leer" />}>
              <Route path="/contexto" element={<ContextListPage />} />
              <Route path="/contexto/nuevo" element={<CreateContextPage />} />
              <Route path="/contexto/:id" element={<ContextDetailPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="activos" accion="leer" />}>
              <Route path="/activos" element={<AssetsListPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="activos" accion="crear" />}>
              <Route path="/activos/nuevo" element={<CreateAssetPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="activos" accion="actualizar" />}>
              <Route path="/activos/:id/editar" element={<EditAssetPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="amenazas" accion="leer" />}>
              <Route path="/amenazas" element={<ThreatsListPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="amenazas" accion="crear" />}>
              <Route path="/amenazas/nueva" element={<CreateThreatPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="amenazas" accion="actualizar" />}>
              <Route path="/amenazas/:id/editar" element={<EditThreatPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="vulnerabilidades" accion="leer" />}>
              <Route path="/vulnerabilidades" element={<VulnerabilitiesListPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="vulnerabilidades" accion="crear" />}>
              <Route path="/vulnerabilidades/nueva" element={<CreateVulnerabilityPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="vulnerabilidades" accion="actualizar" />}>
              <Route path="/vulnerabilidades/:id/editar" element={<EditVulnerabilityPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="controles" accion="leer" />}>
              <Route path="/controles" element={<ControlsListPage />} />
              <Route path="/controles/:id" element={<ControlDetailPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="controles" accion="crear" />}>
              <Route path="/controles/nuevo" element={<CreateControlPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="controles" accion="actualizar" />}>
              <Route path="/controles/:id/editar" element={<EditControlPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="riesgos" accion="leer" />}>
              <Route path="/riesgos" element={<RisksListPage />} />
              <Route path="/riesgos/matriz" element={<RiskMatrixPage />} />
              <Route path="/riesgos/:id" element={<RiskDetailPage />} />
              <Route path="/riesgos/:riesgoId/evaluaciones/nueva" element={<EvaluationCreatePage />} />
              <Route path="/riesgos/:riesgoId/evaluaciones" element={<EvaluationHistoryPage />} />
              <Route path="/riesgos/:riesgoId/tratamientos/nuevo" element={<TreatmentCreatePage />} />
              <Route
                path="/riesgos/:riesgoId/evaluaciones/:evaluacionId/tratamiento/nuevo"
                element={<TreatmentCreatePage />}
              />
              <Route path="/tratamientos/:id" element={<TreatmentDetailPage />} />
            </Route>
            <Route element={<RequierePermiso recurso="riesgos" accion="crear" />}>
              <Route path="/riesgos/nuevo" element={<CreateRiskPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="reportes" accion="leer" />}>
              <Route path="/reportes" element={<ReportsPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="auditoria" accion="leer" />}>
              <Route path="/auditoria" element={<AuditListPage />} />
            </Route>

            <Route element={<RequierePermiso recurso="eventosSeguridad" accion="leer" />}>
              <Route path="/eventos-seguridad" element={<SecurityEventsListPage />} />
            </Route>
          </Route>
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}