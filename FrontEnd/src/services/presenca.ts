import { api } from "./api";

export type PresencaUsuario = {
  matricula: string;
  nome: string;
  perfil: string;
  ultimaAtividade: string;
};

export async function enviarHeartbeat() {
  await api.post("/presenca/heartbeat");
}

export async function listarUsuariosOnline() {
  const response = await api.get<PresencaUsuario[]>("/presenca/online");
  return response.data;
}
