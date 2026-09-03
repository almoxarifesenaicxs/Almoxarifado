import { useState } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";

import "./StatusGuide.css";

export type StatusGuideItem = {
  nome: string;
  descricao: string;
  tipo:
    | "aguardando"
    | "analise"
    | "andamento"
    | "material"
    | "concluido"
    | "cancelado";
};

type StatusGuideProps = {
  titulo: string;
  itens: StatusGuideItem[];
};

function StatusGuide({ titulo, itens }: StatusGuideProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        className="status-guide-atalho"
        onClick={() => setAberto((estadoAtual) => !estadoAtual)}
        aria-label={aberto ? "Fechar guia de status" : "Abrir guia de status"}
        aria-expanded={aberto}
        title="Guia de status"
      >
        <FiAlertCircle aria-hidden="true" />
      </button>

      {aberto && (
        <aside className="status-guide" aria-label={titulo}>
          <header>
            <div>
              <FiAlertCircle aria-hidden="true" />
              <h2>{titulo}</h2>
            </div>
            <button
              type="button"
              className="status-guide-fechar"
              onClick={() => setAberto(false)}
              aria-label="Fechar guia de status"
              title="Fechar"
            >
              <FiX aria-hidden="true" />
            </button>
          </header>

          <div className="status-guide-lista">
            {itens.map((item) => (
              <div className="status-guide-item" key={item.nome}>
                <span className={`status-guide-badge ${item.tipo}`}>
                  <span aria-hidden="true" />
                  {item.nome}
                </span>
                <p>{item.descricao}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}

export default StatusGuide;
