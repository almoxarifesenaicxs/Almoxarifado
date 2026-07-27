import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiInfo,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  esvaziarLixeiraNotificacoesApi,
  excluirNotificacaoApi,
  excluirNotificacaoPermanentementeApi,
  listarLixeiraNotificacoesApi,
  listarNotificacoesApi,
  marcarNotificacaoLidaApi,
  marcarTodasNotificacoesLidasApi,
  restaurarNotificacaoApi,
  type NotificacaoApi,
} from "../../services/notificacoes";

import "./Notificacoes.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function prioridadeVisual(notificacao: NotificacaoApi) {
  if (notificacao.tipo.toLowerCase().includes("urgente")) return "Urgente";
  if (notificacao.cor === "red") return "Urgente";
  if (notificacao.cor === "yellow") return "Alta";
  return "Normal";
}

function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoApi[]>([]);
  const [lixeira, setLixeira] = useState<NotificacaoApi[]>([]);
  const [lixeiraAberta, setLixeiraAberta] = useState(false);
  const [carregandoLixeira, setCarregandoLixeira] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const [dados, excluidas] = await Promise.all([
          listarNotificacoesApi(),
          listarLixeiraNotificacoesApi(),
        ]);

        if (ativo) {
          setNotificacoes(dados);
          setLixeira(excluidas);
          setErro("");
        }
      } catch {
        if (ativo) {
      setErro("Não foi possível carregar suas notificações agora.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarInicial();

    return () => {
      ativo = false;
    };
  }, []);

  async function marcarComoLida(id: string) {
    try {
      setAcaoEmAndamento(id);
      await marcarNotificacaoLidaApi(id);
      setNotificacoes((atuais) =>
        atuais.map((notificacao) =>
          notificacao.id === id ? { ...notificacao, lida: true } : notificacao,
        ),
      );
      setErro("");
    } catch {
      setErro("Não foi possível atualizar a notificação.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function abrirOrigem(notificacao: NotificacaoApi) {
    const destino =
      notificacao.link ||
      (notificacao.demandaId
        ? `/demandas/detalhes/${notificacao.demandaId}`
        : null);

    if (!destino) return;

    try {
      setAcaoEmAndamento(`abrir-${notificacao.id}`);

      if (!notificacao.lida) {
        await marcarNotificacaoLidaApi(notificacao.id);
      }

      navigate(destino);
    } catch {
      setErro("Não foi possível abrir a origem da notificação.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function marcarTodas() {
    try {
      setAcaoEmAndamento("todas");
      await marcarTodasNotificacoesLidasApi();
      setNotificacoes((atuais) =>
        atuais.map((notificacao) => ({ ...notificacao, lida: true })),
      );
      setErro("");
    } catch {
      setErro("Não foi possível atualizar as notificações.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function excluirNotificacao(notificacao: NotificacaoApi) {
    const confirmou = window.confirm(
      `Deseja mover a notificação "${notificacao.titulo}" para a lixeira?`,
    );

    if (!confirmou) return;

    try {
      setAcaoEmAndamento(`excluir-${notificacao.id}`);
      await excluirNotificacaoApi(notificacao.id);
      setNotificacoes((atuais) =>
        atuais.filter((item) => item.id !== notificacao.id),
      );
      setLixeira((atuais) => [
        {
          ...notificacao,
          excluida: true,
          dataExclusao: new Date().toISOString(),
        },
        ...atuais,
      ]);
      setErro("");
    } catch {
      setErro("Não foi possível excluir a notificação.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function abrirLixeira() {
    setLixeiraAberta(true);
    setCarregandoLixeira(true);

    try {
      const excluidas = await listarLixeiraNotificacoesApi();
      setLixeira(excluidas);
      setErro("");
    } catch {
      setErro("Não foi possível carregar a lixeira.");
    } finally {
      setCarregandoLixeira(false);
    }
  }

  async function restaurarNotificacao(notificacao: NotificacaoApi) {
    try {
      setAcaoEmAndamento(`restaurar-${notificacao.id}`);
      await restaurarNotificacaoApi(notificacao.id);
      setLixeira((atuais) =>
        atuais.filter((item) => item.id !== notificacao.id),
      );
      setNotificacoes((atuais) => [
        { ...notificacao, excluida: false, dataExclusao: null },
        ...atuais,
      ]);
      setErro("");
    } catch {
      setErro("Não foi possível restaurar a notificação.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function excluirPermanentemente(notificacao: NotificacaoApi) {
    const confirmou = window.confirm(
      `Excluir permanentemente a notificação "${notificacao.titulo}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmou) return;

    try {
      setAcaoEmAndamento(`permanente-${notificacao.id}`);
      await excluirNotificacaoPermanentementeApi(notificacao.id);
      setLixeira((atuais) =>
        atuais.filter((item) => item.id !== notificacao.id),
      );
      setErro("");
    } catch {
      setErro("Não foi possível excluir a notificação permanentemente.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function esvaziarLixeira() {
    if (lixeira.length === 0) return;

    const confirmou = window.confirm(
      `Excluir permanentemente as ${lixeira.length} notificações da lixeira? Esta ação não pode ser desfeita.`,
    );

    if (!confirmou) return;

    try {
      setAcaoEmAndamento("esvaziar-lixeira");
      await esvaziarLixeiraNotificacoesApi();
      setLixeira([]);
      setErro("");
    } catch {
      setErro("Não foi possível esvaziar a lixeira.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  function limparFiltros() {
    setBusca("");
    setFiltroTipo("");
    setFiltroStatus("");
  }

  const notificacoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return notificacoes.filter((notificacao) => {
      const status = notificacao.lida ? "Lida" : "Não lida";

      const correspondeBusca =
        notificacao.titulo.toLowerCase().includes(termo) ||
        notificacao.mensagem.toLowerCase().includes(termo) ||
        notificacao.id.toLowerCase().includes(termo);

      const correspondeTipo = !filtroTipo || notificacao.tipo === filtroTipo;
      const correspondeStatus = !filtroStatus || status === filtroStatus;

      return correspondeBusca && correspondeTipo && correspondeStatus;
    });
  }, [busca, filtroTipo, filtroStatus, notificacoes]);

  const total = notificacoes.length;
  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;
  const urgentes = notificacoes.filter(
    (notificacao) => prioridadeVisual(notificacao) === "Urgente",
  ).length;
  const sistema = notificacoes.filter(
    (notificacao) => notificacao.tipo === "Sistema",
  ).length;

  return (
    <div className="notificacoes-layout">
      <Sidebar />

      <main className="notificacoes-main">
        <Header titulo="Notificações" />

        <section className="notificacoes-conteudo">
          <header className="notificacoes-cabecalho">
            <div>
              <p>Central de alertas e atualizações do sistema.</p>
            </div>

            <button
              type="button"
              className="notificacoes-botao-marcar"
              onClick={() => void marcarTodas()}
              disabled={naoLidas === 0 || acaoEmAndamento !== null}
            >
              {acaoEmAndamento === "todas"
                ? "Marcando..."
                : naoLidas === 0
                  ? "Todas estão lidas"
                  : "Marcar todas como lidas"}
            </button>
          </header>

          {erro && <div className="notificacoes-alerta">{erro}</div>}

          <section className="notificacoes-resumo">
            <article>
              <FiBell />
              <div>
                <strong>{total}</strong>
                <span>Total</span>
              </div>
            </article>

            <article className="nao-lidas">
              <FiClock />
              <div>
                <strong>{naoLidas}</strong>
                <span>Não lidas</span>
              </div>
            </article>

            <article className="urgentes">
              <FiAlertTriangle />
              <div>
                <strong>{urgentes}</strong>
                <span>Urgentes</span>
              </div>
            </article>

            <article className="sistema">
              <FiInfo />
              <div>
                <strong>{sistema}</strong>
                <span>Sistema</span>
              </div>
            </article>
          </section>

          <section className="notificacoes-filtros">
            <div className="notificacoes-busca">
              <FiSearch />
              <input
                type="text"
              placeholder="Buscar notificação..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(evento) => setFiltroTipo(evento.target.value)}
            >
              <option value="">Todos os tipos</option>
              {[...new Set(notificacoes.map((n) => n.tipo))].map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Não lida">Não lida</option>
              <option value="Lida">Lida</option>
            </select>

            <button type="button" onClick={limparFiltros}>
              <FiFilter />
              Limpar
            </button>
          </section>

          <section className="notificacoes-lista">
            {notificacoesFiltradas.map((notificacao) => {
              const prioridade = prioridadeVisual(notificacao);
              const status = notificacao.lida ? "Lida" : "Não lida";

              return (
                <article
                  key={notificacao.id}
                  className={`notificacao-card ${!notificacao.lida ? "nao-lida" : ""}`}
                >
                  <div className={`notificacao-icone ${prioridade.toLowerCase()}`}>
                    {prioridade === "Urgente" ? (
                      <FiAlertTriangle />
                    ) : notificacao.lida ? (
                      <FiCheckCircle />
                    ) : (
                      <FiBell />
                    )}
                  </div>

                  <div className="notificacao-corpo">
                    <div className="notificacao-topo">
                      <div>
                        <span>{notificacao.id}</span>
                        <h2>{notificacao.titulo}</h2>
                      </div>

                      <strong>{formatarData(notificacao.dataCriacao)}</strong>
                    </div>

                    <p>{notificacao.mensagem}</p>

                    <footer>
                      <span
                        className={`notificacao-prioridade ${prioridade.toLowerCase()}`}
                      >
                        {prioridade}
                      </span>

                      <span className="notificacao-status">{status}</span>

                      {!notificacao.lida && (
                        <button
                          type="button"
                          onClick={() => void marcarComoLida(notificacao.id)}
                          disabled={acaoEmAndamento !== null}
                        >
                          {acaoEmAndamento === notificacao.id
                            ? "Marcando..."
                            : "Marcar como lida"}
                        </button>
                      )}

                      {(notificacao.link || notificacao.demandaId) && (
                        <button
                          type="button"
                          className="notificacao-botao-origem"
                          onClick={() => void abrirOrigem(notificacao)}
                          disabled={acaoEmAndamento !== null}
                        >
                          {acaoEmAndamento === `abrir-${notificacao.id}`
                            ? "Abrindo..."
                            : "Abrir origem"}
                        </button>
                      )}

                      <button
                        type="button"
                        className="notificacao-botao-excluir"
                        onClick={() => void excluirNotificacao(notificacao)}
                        disabled={acaoEmAndamento !== null}
                        aria-label={`Excluir notificação ${notificacao.titulo}`}
                      >
                        <FiTrash2 />
                        {acaoEmAndamento === `excluir-${notificacao.id}`
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </footer>
                  </div>
                </article>
              );
            })}

            {carregando && (
              <div className="notificacoes-vazio">
                Carregando notificações...
              </div>
            )}

            {!carregando && notificacoesFiltradas.length === 0 && (
              <div className="notificacoes-vazio">
                Nenhuma notificação encontrada.
              </div>
            )}
          </section>
        </section>

        <button
          type="button"
          className="notificacoes-lixeira-atalho"
          onClick={() => void abrirLixeira()}
          aria-label={`Abrir lixeira com ${lixeira.length} notificações`}
          title="Lixeira de notificações"
        >
          <FiTrash2 />
          {lixeira.length > 0 && <span>{lixeira.length}</span>}
        </button>

        {lixeiraAberta && (
          <div
            className="notificacoes-lixeira-fundo"
            role="presentation"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                setLixeiraAberta(false);
              }
            }}
          >
            <aside
              className="notificacoes-lixeira-painel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notificacoes-lixeira-titulo"
            >
              <header>
                <div>
                  <FiTrash2 />
                  <div>
                    <h2 id="notificacoes-lixeira-titulo">Lixeira</h2>
                    <p>{lixeira.length} notificação(ões) excluída(s)</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="notificacoes-lixeira-fechar"
                  onClick={() => setLixeiraAberta(false)}
                  aria-label="Fechar lixeira"
                >
                  <FiX />
                </button>
              </header>

              <div className="notificacoes-lixeira-lista">
                {carregandoLixeira && (
                  <div className="notificacoes-lixeira-vazia">
                    Carregando lixeira...
                  </div>
                )}

                {!carregandoLixeira && lixeira.length === 0 && (
                  <div className="notificacoes-lixeira-vazia">
                    <FiTrash2 />
                    <strong>A lixeira está vazia</strong>
                    <span>As notificações excluídas aparecerão aqui.</span>
                  </div>
                )}

                {!carregandoLixeira &&
                  lixeira.map((notificacao) => (
                    <article key={notificacao.id}>
                      <div>
                        <strong>{notificacao.titulo}</strong>
                        <p>{notificacao.mensagem}</p>
                        <small>
                          Excluída em{" "}
                          {formatarData(
                            notificacao.dataExclusao ?? notificacao.dataCriacao,
                          )}
                        </small>
                      </div>

                      <footer>
                        <button
                          type="button"
                          className="notificacoes-lixeira-restaurar"
                          onClick={() => void restaurarNotificacao(notificacao)}
                          disabled={acaoEmAndamento !== null}
                        >
                          <FiRefreshCw />
                          {acaoEmAndamento === `restaurar-${notificacao.id}`
                            ? "Restaurando..."
                            : "Restaurar"}
                        </button>

                        <button
                          type="button"
                          className="notificacoes-lixeira-excluir"
                          onClick={() =>
                            void excluirPermanentemente(notificacao)
                          }
                          disabled={acaoEmAndamento !== null}
                        >
                          <FiTrash2 />
                          {acaoEmAndamento === `permanente-${notificacao.id}`
                            ? "Excluindo..."
                            : "Excluir permanentemente"}
                        </button>
                      </footer>
                    </article>
                  ))}
              </div>

              <footer className="notificacoes-lixeira-rodape">
                <button
                  type="button"
                  onClick={() => void esvaziarLixeira()}
                  disabled={lixeira.length === 0 || acaoEmAndamento !== null}
                >
                  <FiTrash2 />
                  {acaoEmAndamento === "esvaziar-lixeira"
                    ? "Esvaziando..."
                    : "Esvaziar lixeira"}
                </button>
              </footer>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Notificacoes;
