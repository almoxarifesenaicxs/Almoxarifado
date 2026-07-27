import { api } from "./api";

export type NotificacaoApi = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  icone: string;
  cor: string;
  link?: string | null;
  demandaId?: string | null;
  lida: boolean;
  dataCriacao: string;
  dataLeitura?: string | null;
  excluida: boolean;
  dataExclusao?: string | null;
};

export async function listarNotificacoesApi() {
  const response = await api.get<NotificacaoApi[]>("/Notificacoes");
  return response.data;
}

export async function contarNotificacoesNaoLidasApi() {
  const response = await api.get<{ total: number }>(
    "/Notificacoes/nao-lidas/contador",
  );
  return response.data.total;
}

export async function marcarNotificacaoLidaApi(id: string, lida = true) {
  await api.put(`/Notificacoes/${id}/marcar-lida`, { lida });
  window.dispatchEvent(new CustomEvent("notificacoes-atualizadas"));
}

export async function marcarTodasNotificacoesLidasApi() {
  await api.put("/Notificacoes/marcar-todas-lidas");
  window.dispatchEvent(new CustomEvent("notificacoes-atualizadas"));
}

export async function excluirNotificacaoApi(id: string) {
  await api.delete(`/Notificacoes/${id}`);
  window.dispatchEvent(new CustomEvent("notificacoes-atualizadas"));
}

export async function listarLixeiraNotificacoesApi() {
  const response = await api.get<NotificacaoApi[]>("/Notificacoes/lixeira");
  return response.data;
}

export async function restaurarNotificacaoApi(id: string) {
  await api.put(`/Notificacoes/${id}/restaurar`);
  window.dispatchEvent(new CustomEvent("notificacoes-atualizadas"));
}

export async function excluirNotificacaoPermanentementeApi(id: string) {
  await api.delete(`/Notificacoes/${id}/permanente`);
}

export async function esvaziarLixeiraNotificacoesApi() {
  await api.delete("/Notificacoes/lixeira");
}
