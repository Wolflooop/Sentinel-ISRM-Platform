import { apiClient } from "../../../lib/apiClient";
import { LoginFormValues } from "../schemas/loginSchema";
import { LoginResponse } from "../types/auth.types";

export async function loginRequest(input: LoginFormValues): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", input);
  return data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}
