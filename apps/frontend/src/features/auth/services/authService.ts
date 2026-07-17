import { apiClient } from "../../../lib/apiClient";
import { LoginFormValues } from "../schemas/loginSchema";
import { LoginResponse, PerfilActual } from "../types/auth.types";

export async function loginRequest(input: LoginFormValues): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", input);
  return data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function obtenerPerfilActualRequest(): Promise<PerfilActual> {
  const { data } = await apiClient.get<PerfilActual>("/auth/me");
  return data;
}
