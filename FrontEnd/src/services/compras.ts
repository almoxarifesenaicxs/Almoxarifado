import { api } from "./api";

export const STATUS_COMPRA = ["Aguardando", "Aprovado", "Rejeitado", "Concluído"] as const;
export type StatusCompra = (typeof STATUS_COMPRA)[number];

export function normalizarStatusCompra(status: string): StatusCompra {
  const valor = status.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (valor === "aprovado") return "Aprovado";
  if (valor === "rejeitado") return "Rejeitado";
  if (valor === "concluido") return "Concluído";
  return "Aguardando";
}

export type SolicitacaoCompra = {
  id: string;
  categoria: string;
  nomeItem: string;
  especificacao: string;
  quantidade: number;
  urgencia: string;
  justificativa: string;
  almoxarifeMatricula: string;
  almoxarifeNome: string;
  dataSolicitacao: string;
  status: StatusCompra;
};

export type CriarSolicitacaoCompraPayload = {
  categoria: string;
  nomeItem: string;
  especificacao: string;
  quantidade: number;
  urgencia: string;
  justificativa: string;
};

function padronizar(compra: SolicitacaoCompra): SolicitacaoCompra {
  return { ...compra, status: normalizarStatusCompra(compra.status) };
}

export async function listarComprasApi(status?: StatusCompra) {
  const response = await api.get<SolicitacaoCompra[]>("/SolicitacoesCompra", {
    params: status ? { status } : undefined,
  });
  return response.data.map(padronizar);
}

export async function obterCompraApi(id: string) {
  const response = await api.get<SolicitacaoCompra>(`/SolicitacoesCompra/${id}`);
  return padronizar(response.data);
}

export async function criarCompraApi(payload: CriarSolicitacaoCompraPayload) {
  const response = await api.post<{ solicitacao: SolicitacaoCompra }>(
    "/SolicitacoesCompra", payload,
  );
  return padronizar(response.data.solicitacao);
}

export async function atualizarStatusCompraApi(id: string, status: StatusCompra) {
  const response = await api.put<{ solicitacao: SolicitacaoCompra }>(
    `/SolicitacoesCompra/${id}/status`, { status },
  );
  return padronizar(response.data.solicitacao);
}
