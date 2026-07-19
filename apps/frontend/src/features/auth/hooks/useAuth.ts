import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginRequest, logoutRequest } from "../services/authService";
import { LoginFormValues } from "../schemas/loginSchema";
import { tokenStorage } from "../../../lib/tokenStorage";

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: (data) => {
      tokenStorage.set(data.token);
      // Corrección: el queryKey ["auth","perfil-actual"] es el mismo para
      // cualquier usuario, así que si no se elimina aquí, el próximo montaje
      // de usePerfilActual() reutiliza (dentro de staleTime) el perfil y los
      // permisos del usuario anterior en vez de pedir los del que acaba de
      // iniciar sesión.
      queryClient.removeQueries({ queryKey: ["auth", "perfil-actual"] });
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
      // Misma razón que en useLogin: sin esto, el perfil/permisos del
      // usuario que cierra sesión quedan en caché y podrían filtrarse al
      // siguiente usuario que inicie sesión en la misma pestaña.
      queryClient.removeQueries({ queryKey: ["auth", "perfil-actual"] });
      navigate("/login", { replace: true });
    },
  });
}
