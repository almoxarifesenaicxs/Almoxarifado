import { Navigate } from "react-router-dom";
import { getUsuarioLogado } from "../services/auth";
import type { Perfil } from "../types/user";
import { getProgramaSelecionado } from "../services/programas";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedProfiles?: Perfil[];
  requireProgram?: boolean;
}

export default function PrivateRoute({
  children,
  allowedProfiles,
  requireProgram = true,
}: PrivateRouteProps) {
  const usuario = getUsuarioLogado();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (requireProgram && !getProgramaSelecionado()) {
    return <Navigate to="/programas" replace />;
  }

  if (allowedProfiles && !allowedProfiles.includes(usuario.perfil)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
