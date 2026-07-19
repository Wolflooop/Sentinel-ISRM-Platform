import { useQuery } from "@tanstack/react-query";
import { listarRolesRequest } from "../services/rolesService";

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: listarRolesRequest,
  });
}
