import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "@senai:token";
const USUARIO_KEY = "@senai:user";

export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.includes("/Auth/login")
    ) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);

      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login?motivo=sessao-expirada");
      }
    }

    return Promise.reject(error);
  },
);

export function obterMensagemErroApi(
  error: unknown,
  mensagemPadrao: string,
) {
  if (!axios.isAxiosError(error)) return mensagemPadrao;

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const resposta = data as {
      mensagem?: string;
      title?: string;
    };

    if (resposta.mensagem?.trim()) return resposta.mensagem;
    if (resposta.title?.trim()) return resposta.title;
  }

  if (!error.response) {
    return "Não foi possível conectar à API. Verifique se o servidor está ativo.";
  }

  return mensagemPadrao;
}
