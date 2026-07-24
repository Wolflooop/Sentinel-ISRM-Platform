import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginRequest, logoutRequest } from "../services/authService";
import { LoginFormValues } from "../schemas/loginSchema";
import { tokenStorage } from "../../../lib/tokenStorage";

// Prefijos de queryKey de todos los recursos con datos por
// organización/usuario en la app. Se centraliza esta lista aquí (en vez
// de usar queryClient.clear()) para poder limpiar el cache de forma
// específica al cambiar de identidad, sin afectar el resto de la
// configuración del QueryClient (defaults, mutation cache, etc.).
// Si se agrega un hook nuevo con un queryKey de recurso nuevo, debe
// añadirse su prefijo aquí para quedar cubierto por esta limpieza.
const QUERY_KEYS_POR_SESION: string[] = [
  "auth",
  "dashboard",
  "usuarios",
  "organizaciones",
  "organizacion-actual",
  "roles",
  "contextos",
  "contextoActivo",
  "categorias-identificacion-riesgo",
  "activos",
  "amenazas",
  "vulnerabilidades",
  "riesgos",
  "evaluaciones",
  "tratamientos",
  "resoluciones-riesgo",
  "controles",
  "reportes",
  "evidencias",
  "comentarios",
  "seguimientos",
];

function limpiarCacheDeSesion(queryClient: ReturnType<typeof useQueryClient>) {
  QUERY_KEYS_POR_SESION.forEach((prefijo) => {
    queryClient.removeQueries({ queryKey: [prefijo] });
  });
}

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: (data) => {
      tokenStorage.set(data.token);
      // Corrección: ningún queryKey de recurso (activos, riesgos,
      // dashboard, etc.) incluye organizacionId/sessionId, así que sin
      // esta limpieza el próximo montaje de esos hooks podría reutilizar
      // (dentro de staleTime) datos cacheados de la sesión anterior antes
      // de que el refetch en segundo plano los reemplace.
      limpiarCacheDeSesion(queryClient);
      navigate("/", { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      tokenStorage.clear();
      // Misma razón que en useLogin: sin esto, los datos de la sesión que
      // cierra (perfil, permisos, y cualquier recurso ya cacheado) podrían
      // filtrarse momentáneamente al siguiente usuario que inicie sesión
      // en la misma pestaña.
      limpiarCacheDeSesion(queryClient);
      navigate("/login", { replace: true });
    },
  });
}
