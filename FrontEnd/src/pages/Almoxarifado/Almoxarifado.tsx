import { useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiFilter,
  FiX,
  FiClock,
  FiUser,
  FiMapPin,
  FiFileText,
  FiPlayCircle,
  FiPackage,
  FiCheckCircle,
  FiSlash,
  FiAlertCircle,
  FiBox,
  FiCheck,
} from "react-icons/fi";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import StatusGuide from "../../components/StatusGuide/StatusGuide";
import { STATUS_GUIDE_DEMANDAS } from "../../components/StatusGuide/statusGuideData";
import {
  alterarStatusDemandaApi,
  listarDemandasApi,
  type DemandaApi,
  type StatusDemanda,
} from "../../services/demandas";

import "./Almoxarifado.css";

const colunas: Array<{
  titulo: string;
  status: StatusDemanda;
}> = [
  { titulo: "Abertas", status: "Aberta" },
  { titulo: "Em Análise", status: "Em Análise" },
  { titulo: "Em Andamento", status: "Em Andamento" },
  { titulo: "Aguardando Material", status: "Aguardando Material" },
  { titulo: "Concluídas", status: "Concluída" },
  { titulo: "Canceladas", status: "Cancelada" },
];

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function classePrioridade(prioridade: string) {
  return prioridade
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textoPrazo(status: StatusDemanda) {
  return status === "Concluída" ? "Concluída em:" : "Prazo:";
}

function proximoStatus(status: StatusDemanda): StatusDemanda {
  if (status === "Aberta") return "Em Análise";
  if (status === "Em Análise") return "Em Andamento";
  if (status === "Em Andamento") return "Aguardando Material";
  if (status === "Aguardando Material") return "Concluída";
  return "Aberta";
}

function Almoxarifado() {
  const [demandas, setDemandas] = useState<DemandaApi[]>([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [demandaAberta, setDemandaAberta] = useState<DemandaApi | null>(null);

  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroOficina, setFiltroOficina] = useState("");
  const [ordenacao, setOrdenacao] = useState("prazo");

  const [colunasExpandidas, setColunasExpandidas] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let ativo = true;

    async function carregarDemandas() {
      try {
        const dados = await listarDemandasApi();

        if (ativo) {
          setDemandas(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
      setErro("Não foi possível carregar a fila no momento.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarDemandas();

    return () => {
      ativo = false;
    };
  }, []);

  const oficinasDisponiveis = useMemo(() => {
    return [...new Set(demandas.map((demanda) => demanda.oficina))];
  }, [demandas]);

  const demandasOrdenadas = useMemo(() => {
    const pesoPrioridade = {
      Urgente: 1,
      Alta: 2,
      Normal: 3,
      Baixa: 4,
    };

    return demandas
      .filter((demanda) => {
        const correspondePrioridade =
          !filtroPrioridade || demanda.prioridade === filtroPrioridade;

        const correspondeOficina =
          !filtroOficina || demanda.oficina === filtroOficina;

        return correspondePrioridade && correspondeOficina;
      })
      .sort((a, b) => {
        if (ordenacao === "prioridade") {
          return pesoPrioridade[a.prioridade] - pesoPrioridade[b.prioridade];
        }

        return (
          new Date(a.dataHoraNecessaria).getTime() -
          new Date(b.dataHoraNecessaria).getTime()
        );
      });
  }, [demandas, filtroPrioridade, filtroOficina, ordenacao]);

  async function alterarStatus(id: string, novoStatus: StatusDemanda) {
    try {
      const demandaAtualizada = await alterarStatusDemandaApi(id, novoStatus);

      setDemandas((estadoAtual) =>
        estadoAtual.map((demanda) =>
          demanda.id === id ? demandaAtualizada : demanda,
        ),
      );
    } catch {
      setErro("Não foi possível atualizar a demanda. Tente novamente.");
      return;
    }

    setTimeout(() => {
      setDemandaAberta(null);
    }, 300);
  }

  function avancarStatus(demanda: DemandaApi) {
    void alterarStatus(demanda.id, proximoStatus(demanda.status));
  }

  function alternarVerMais(status: StatusDemanda) {
    setColunasExpandidas((estadoAtual) => ({
      ...estadoAtual,
      [status]: !estadoAtual[status],
    }));
  }

  return (
    <div className="almoxarifado-layout">
      <Sidebar />

      <main className="almoxarifado-main">
        <Header titulo="Almoxarifado" />
        <section className="almoxarifado-conteudo">
          <header className="almoxarifado-cabecalho">
            <div>
              <h1>Fila de Demandas</h1>
              <p>Gerencie e priorize as demandas do almoxarifado.</p>
            </div>
          </header>

          {erro && <div className="almoxarifado-alerta">{erro}</div>}
          <StatusGuide
            titulo="Entenda os status das demandas"
            itens={STATUS_GUIDE_DEMANDAS}
          />
          <section className="almoxarifado-resumo">
            <article className="almoxarifado-resumo-card abertas">
              <div className="almoxarifado-resumo-icone">
                <FiAlertCircle />
              </div>
              <div>
                <strong>
                  {
                    demandas.filter((demanda) => demanda.status === "Aberta")
                      .length
                  }
                </strong>
                <span>Abertas</span>
              </div>
            </article>

            <article className="almoxarifado-resumo-card analise">
              <div className="almoxarifado-resumo-icone"><FiClock /></div>
              <div>
                <strong>{demandas.filter((demanda) => demanda.status === "Em Análise").length}</strong>
                <span>Em Análise</span>
              </div>
            </article>

            <article className="almoxarifado-resumo-card andamento">
              <div className="almoxarifado-resumo-icone">
                <FiPlayCircle />
              </div>
              <div>
                <strong>
                  {
                    demandas.filter(
                      (demanda) => demanda.status === "Em Andamento",
                    ).length
                  }
                </strong>
                <span>Em Andamento</span>
              </div>
            </article>

            <article className="almoxarifado-resumo-card material">
              <div className="almoxarifado-resumo-icone">
                <FiBox />
              </div>
              <div>
                <strong>
                  {
                    demandas.filter(
                      (demanda) => demanda.status === "Aguardando Material",
                    ).length
                  }
                </strong>
                <span>Aguardando Material</span>
              </div>
            </article>

            <article className="almoxarifado-resumo-card concluidas">
              <div className="almoxarifado-resumo-icone">
                <FiCheck />
              </div>
              <div>
                <strong>
                  {
                    demandas.filter((demanda) => demanda.status === "Concluída")
                      .length
                  }
                </strong>
                <span>Concluídas</span>
              </div>
            </article>

            <article className="almoxarifado-resumo-card canceladas">
              <div className="almoxarifado-resumo-icone"><FiSlash /></div>
              <div>
                <strong>{demandas.filter((demanda) => demanda.status === "Cancelada").length}</strong>
                <span>Canceladas</span>
              </div>
            </article>
          </section>
          <div className="almoxarifado-filtros-topo">
            <label>
              Ordenar por:
              <div className="almoxarifado-select">
                <select
                  value={ordenacao}
                  onChange={(evento) => setOrdenacao(evento.target.value)}
                >
                  <option value="prazo">Prazo mais próximo</option>
                  <option value="prioridade">Prioridade</option>
                </select>
                <FiChevronDown />
              </div>
            </label>

            <label>
              Oficina:
              <div className="almoxarifado-select">
                <select
                  value={filtroOficina}
                  onChange={(evento) => setFiltroOficina(evento.target.value)}
                >
                  <option value="">Todas</option>
                  {oficinasDisponiveis.map((oficina) => (
                    <option key={oficina} value={oficina}>
                      {oficina}
                    </option>
                  ))}
                </select>
                <FiChevronDown />
              </div>
            </label>

            <label>
              Prioridade:
              <div className="almoxarifado-select">
                <select
                  value={filtroPrioridade}
                  onChange={(evento) =>
                    setFiltroPrioridade(evento.target.value)
                  }
                >
                  <option value="">Todas</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Alta">Alta</option>
                  <option value="Normal">Normal</option>
                  <option value="Baixa">Baixa</option>
                </select>
                <FiChevronDown />
              </div>
            </label>

            <button
              type="button"
              className="almoxarifado-filtrar"
              onClick={() => {
                setFiltroOficina("");
                setFiltroPrioridade("");
                setOrdenacao("prazo");
              }}
            >
              <FiFilter />
              Limpar
            </button>
          </div>

          <div className="almoxarifado-kanban">
            {colunas.map((coluna) => {
              const demandasDaColuna = demandasOrdenadas.filter(
                (demanda) => demanda.status === coluna.status,
              );

              const estaExpandida = colunasExpandidas[coluna.status];

              const demandasVisiveis = estaExpandida
                ? demandasDaColuna
                : demandasDaColuna.slice(0, 3);

              return (
                <section className="almoxarifado-coluna" key={coluna.status}>
                  <header className="almoxarifado-coluna-topo">
                    <h2>
                      {coluna.titulo} ({demandasDaColuna.length})
                    </h2>
                  </header>

                  <div className="almoxarifado-cards">
                    {carregando && (
                      <div className="almoxarifado-vazio">
                        Carregando demandas...
                      </div>
                    )}

                    {demandasVisiveis.map((demanda) => (
                      <article
                        className="almoxarifado-card"
                        key={demanda.id}
                        onClick={() => setDemandaAberta(demanda)}
                      >
                        <div className="almoxarifado-card-topo">
                          <div>
                            <strong>#{demanda.id.slice(0, 4)}</strong>
                            <h3>{demanda.oficina}</h3>
                          </div>

                          <button
                            type="button"
                            className="almoxarifado-menu-card"
                            onClick={(evento) => {
                              evento.stopPropagation();
                              avancarStatus(demanda);
                            }}
                            title="Avançar status"
                          ></button>
                        </div>

                        <span
                          className={`almoxarifado-prioridade ${classePrioridade(
                            demanda.prioridade,
                          )}`}
                        >
                          {demanda.prioridade}
                        </span>

                        <p className="almoxarifado-prazo">
                          {textoPrazo(demanda.status)}{" "}
                          {formatarData(demanda.dataHoraNecessaria)}
                        </p>

                        <p className="almoxarifado-professor">
                          {demanda.professorNome}
                        </p>
                      </article>
                    ))}

                    {!carregando && demandasDaColuna.length === 0 && (
                      <div className="almoxarifado-vazio">
                        Nenhuma demanda neste status.
                      </div>
                    )}
                  </div>

                  {demandasDaColuna.length > 3 && (
                    <button
                      type="button"
                      className="almoxarifado-ver-mais"
                      onClick={() => alternarVerMais(coluna.status)}
                    >
                      {estaExpandida ? "− Ver menos" : "+ Ver mais"}
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </main>

      {demandaAberta && (
        <div
          className="almoxarifado-modal-fundo"
          onClick={() => setDemandaAberta(null)}
        >
          <aside
            className="almoxarifado-modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="almoxarifado-modal-topo">
              <div>
                <span
                  className={`almoxarifado-prioridade ${classePrioridade(
                    demandaAberta.prioridade,
                  )}`}
                >
                  {demandaAberta.prioridade}
                </span>

                <h2>
                  #{demandaAberta.id.slice(0, 4)} - {demandaAberta.oficina}
                </h2>

                <p>{demandaAberta.titulo}</p>
              </div>

              <button
                type="button"
                className="almoxarifado-fechar"
                onClick={() => setDemandaAberta(null)}
              >
                <FiX />
              </button>
            </header>

            <section className="almoxarifado-modal-status">
              <span>Status atual</span>
              <strong>{demandaAberta.status}</strong>
            </section>

            <section className="almoxarifado-modal-grid">
              <div className="almoxarifado-info-card">
                <FiUser />
                <div>
                  <span>Professor</span>
                  <strong>{demandaAberta.professorNome}</strong>
                </div>
              </div>

              <div className="almoxarifado-info-card">
                <FiClock />
                <div>
                  <span>Prazo operacional</span>
                  <strong>
                    {formatarData(demandaAberta.dataHoraNecessaria)}
                  </strong>
                </div>
              </div>

              <div className="almoxarifado-info-card">
                <FiMapPin />
                <div>
                  <span>Oficina</span>
                  <strong>{demandaAberta.oficina}</strong>
                </div>
              </div>

              <div className="almoxarifado-info-card">
                <FiFileText />
                <div>
                  <span>Criada em</span>
                  <strong>{formatarData(demandaAberta.dataHoraCriacao)}</strong>
                </div>
              </div>
            </section>

            <section className="almoxarifado-modal-secao">
              <h3>Descrição da solicitação</h3>
              <p>{demandaAberta.descricao}</p>
            </section>

            <section className="almoxarifado-modal-secao">
              <h3>Alterar status</h3>

              <div className="almoxarifado-acoes">
                <button
                  type="button"
                  className="acao aberta"
                  onClick={() => void alterarStatus(demandaAberta.id, "Aberta")}
                >
                  <FiFileText />
                  <span>Aberta</span>
                  <FiAlertCircle
                    className="acao-ajuda"
                    aria-label="Aberta: demanda registrada e aguardando atendimento."
                    title="Demanda registrada e aguardando atendimento."
                  />
                </button>

                <button
                  type="button"
                  className="acao analise"
                  onClick={() => void alterarStatus(demandaAberta.id, "Em Análise")}
                >
                  <FiClock />
                  <span>Em análise</span>
                  <FiAlertCircle
                    className="acao-ajuda"
                    aria-label="Em análise: demanda em avaliação antes do atendimento."
                    title="Demanda em avaliação antes do atendimento."
                  />
                </button>

                <button
                  type="button"
                  className="acao andamento"
                  onClick={() =>
                    void alterarStatus(demandaAberta.id, "Em Andamento")
                  }
                >
                  <FiPlayCircle />
                  <span>Em andamento</span>
                  <FiAlertCircle
                    className="acao-ajuda"
                    aria-label="Em andamento: demanda sendo atendida pelo almoxarifado."
                    title="Demanda sendo atendida pelo almoxarifado."
                  />
                </button>

                <button
                  type="button"
                  className="acao material"
                  onClick={() =>
                    void alterarStatus(demandaAberta.id, "Aguardando Material")
                  }
                >
                  <FiPackage />
                  <span>Aguardando material</span>
                  <FiAlertCircle
                    className="acao-ajuda"
                    aria-label="Aguardando material: atendimento pausado até a chegada do material necessário."
                    title="Atendimento pausado até a chegada do material necessário."
                  />
                </button>

                <button
                  type="button"
                  className="acao concluida"
                  onClick={() => void alterarStatus(demandaAberta.id, "Concluída")}
                >
                  <FiCheckCircle />
                  <span>Concluída</span>
                  <FiAlertCircle
                    className="acao-ajuda"
                    aria-label="Concluída: atendimento finalizado."
                    title="Atendimento finalizado."
                  />
                </button>

                <button
                  type="button"
                  className="acao cancelada"
                  onClick={() => void alterarStatus(demandaAberta.id, "Cancelada")}
                >
                  <FiSlash />
                  <span>Cancelar demanda</span>
                  <FiAlertCircle
                    className="acao-ajuda"
                    aria-label="Cancelar demanda: encerra a solicitação sem concluir o atendimento."
                    title="Encerra a solicitação sem concluir o atendimento."
                  />
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Almoxarifado;
