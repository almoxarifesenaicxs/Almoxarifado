import { api } from "./api";

export const STATUS_DEMANDA = [
  "Aberta",
  "Em Análise",
  "Em Andamento",
  "Aguardando Material",
  "Concluída",
  "Cancelada",
] as const;

export type StatusDemanda = (typeof STATUS_DEMANDA)[number];
export type Prioridade = "Baixa" | "Normal" | "Alta" | "Urgente";

export function normalizarStatusDemanda(status: string): StatusDemanda {
  const valor = status.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (valor === "em analise") return "Em Análise";
  if (valor === "em andamento") return "Em Andamento";
  if (valor === "aguardando material") return "Aguardando Material";
  if (valor === "concluida") return "Concluída";
  if (valor === "cancelada") return "Cancelada";
  return "Aberta";
}

export interface DemandaApi {
  id: string;
  titulo: string;
  descricao: string;
  oficina: string;
  prioridade: Prioridade;
  status: StatusDemanda;
  professorNome: string;
  professorMatricula: string;
  dataHoraNecessaria: string;
  dataHoraCriacao: string;
}

export interface CriarDemandaPayload {
  titulo: string;
  descricao: string;
  oficina: string;
  prioridade: Prioridade;
  dataHoraNecessaria: string;
}

function padronizar(demanda: DemandaApi): DemandaApi {
  return { ...demanda, status: normalizarStatusDemanda(demanda.status) };
}

export async function listarDemandasApi() {
  const response = await api.get<DemandaApi[]>("/Demandas");
  return response.data.map(padronizar);
}

export async function obterDemandaApi(id: string) {
  const response = await api.get<DemandaApi>(`/Demandas/${id}`);
  return padronizar(response.data);
}

export async function criarDemandaApi(payload: CriarDemandaPayload) {
  const response = await api.post<{ demanda: DemandaApi }>("/Demandas", payload);
  return padronizar(response.data.demanda);
}

export async function alterarStatusDemandaApi(id: string, status: StatusDemanda) {
  const response = await api.put<{ demanda: DemandaApi }>(
    `/Demandas/${id}/status`, JSON.stringify(status),
    { headers: { "Content-Type": "application/json" } },
  );
  return padronizar(response.data.demanda);
}

export async function cancelarMinhaDemandaApi(id: string) {
  const response = await api.put<{ demanda: DemandaApi }>(`/Demandas/${id}/cancelar`);
  return padronizar(response.data.demanda);
}
