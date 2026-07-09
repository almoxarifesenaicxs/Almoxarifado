import { api } from "./api";

export type AnexoApi = {
  id: string;
  demandaId: string;
  nomeArquivo: string;
  url: string;
  tipo: string;
  mimeType: string;
  usuarioNome: string;
  dataUpload: string;
  tamanho: number;
};

function arquivoParaBase64(arquivo: File) {
  return new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(leitor.error);
    leitor.readAsDataURL(arquivo);
  });
}

export async function enviarAnexoApi(demandaId: string, arquivo: File) {
  const base64Image = await arquivoParaBase64(arquivo);

  const response = await api.post<{ anexo: AnexoApi }>("/Anexos/upload", {
    demandaId,
    base64Image,
    nomeArquivo: arquivo.name,
    mimeType: arquivo.type || "application/octet-stream",
    tipo: arquivo.type.startsWith("image/") ? "Foto" : "Arquivo",
  });

  return response.data.anexo;
}

export async function listarAnexosDemandaApi(demandaId: string) {
  const response = await api.get<AnexoApi[]>(`/Anexos/demanda/${demandaId}`);
  return response.data;
}

export async function baixarAnexoApi(anexo: AnexoApi) {
  const response = await api.get<Blob>(`/Anexos/${anexo.id}/download`, {
    responseType: "blob",
  });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");

  link.href = url;
  link.download = anexo.nomeArquivo;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function criarUrlVisualizacaoAnexoApi(anexo: AnexoApi) {
  const response = await api.get<Blob>(`/Anexos/${anexo.id}/download`, {
    responseType: "blob",
  });

  return URL.createObjectURL(response.data);
}
