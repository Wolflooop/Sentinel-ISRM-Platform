import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginRequest, logoutRequest } from "../services/authService";
import { LoginFormValues } from "../schemas/loginSchema";
import { tokenStorage } from "../../../lib/tokenStorage";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: LoginFormValues) => loginRequest(values),
    onSuccess: (data) => {
      tokenStorage.set(data.token);
      navigate("/", { replace: true });
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
    
      tokenStorage.clear();
      navigate("/login", { replace: true });
    },
  });
}
