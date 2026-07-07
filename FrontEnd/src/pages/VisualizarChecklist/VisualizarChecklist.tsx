import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiPrinter, FiX } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import { listarExecucoesChecklist } from "../../services/checklistsLocal";

import "./VisualizarChecklist.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function VisualizarChecklist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fotoAberta, setFotoAberta] = useState<string | null>(null);

  const execucao = useMemo(() => {
    return listarExecucoesChecklist().find((item) => item.id === id);
  }, [id]);

  if (!execucao) {
    return (
      <div className="visualizar-layout">
        <Sidebar />

        <main className="visualizar-main">
          <section className="visualizar-conteudo">
            <button
              type="button"
              className="visualizar-voltar"
              onClick={() => navigate("/checklists/historico")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <h1>Execução não encontrada</h1>
          </section>
        </main>
      </div>
    );
  }

  const conformes = execucao.itens.filter((i) => i.status === "Conforme").length;
  const faltantes = execucao.itens.filter((i) => i.status === "Faltante").length;
  const danificados = execucao.itens.filter(
    (i) => i.status === "Danificado"
  ).length;

  return (
    <div className="visualizar-layout">
      <Sidebar />

      <main className="visualizar-main">
        <section className="visualizar-conteudo">
          <header className="visualizar-cabecalho">
            <button
              type="button"
              className="visualizar-voltar"
              onClick={() => navigate("/checklists/historico")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <div className="visualizar-cabecalho-linha">
              <div>
                <h1>{execucao.nomeModelo}</h1>

                <p>
                  {execucao.oficina} • {execucao.categoria} •{" "}
                  {formatarData(execucao.dataExecucao)}
                </p>
              </div>

              <button
                type="button"
                className="visualizar-imprimir"
                onClick={() => window.print()}
              >
                <FiPrinter />
                Exportar / Imprimir
              </button>
            </div>
          </header>

          <div className="visualizar-resumo">
            <div>
              <strong>{execucao.itens.length}</strong>
              <span>Total</span>
            </div>

            <div className="ok">
              <strong>{conformes}</strong>
              <span>Conformes</span>
            </div>

            <div className="alerta">
              <strong>{faltantes}</strong>
              <span>Faltantes</span>
            </div>

            <div className="critico">
              <strong>{danificados}</strong>
              <span>Danificados</span>
            </div>
          </div>

          <div className="visualizar-info">
            <strong>Executado por:</strong>
            <span>{execucao.almoxarifeNome}</span>
          </div>

          <div className="visualizar-card">
            {execucao.itens.map((item) => (
              <article
                className={`visualizar-item ${item.status.toLowerCase()}`}
                key={item.id}
              >
                <div>
                  <h2>{item.descricao}</h2>
                  <p>{item.observacao || "Sem observação registrada."}</p>
                </div>

                <div className="visualizar-item-acoes">
                  <span
                    className={`visualizar-status ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>

                  {item.foto && (
                    <button
                      type="button"
                      className="visualizar-thumb"
                      onClick={() => setFotoAberta(item.foto || null)}
                    >
                      <img src={item.foto} alt="Foto do checklist" />
                      <span>
                        <FiCamera />
                      </span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {fotoAberta && (
          <div className="visualizar-modal-foto">
            <button
              type="button"
              className="visualizar-fechar-foto"
              onClick={() => setFotoAberta(null)}
            >
              <FiX />
            </button>

            <img src={fotoAberta} alt="Foto ampliada do checklist" />
          </div>
        )}
      </main>
    </div>
  );
}

export default VisualizarChecklist;