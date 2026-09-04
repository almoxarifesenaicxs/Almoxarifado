import { useState } from "react";
import { FiArrowRight, FiBox, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { getUsuarioLogado, logout } from "../../services/auth";
import { programas, selecionarPrograma } from "../../services/programas";
import { alternarTema, getTemaSalvo, type ThemeMode } from "../../services/theme";
import "./Programas.css";

export default function Programas() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const [tema, setTema] = useState<ThemeMode>(getTemaSalvo);

  const programasPermitidos = programas.filter((programa) =>
    usuario ? programa.perfisPermitidos.includes(usuario.perfil) : false,
  );

  function acessarPrograma(programaId: (typeof programas)[number]["id"], rota: string) {
    selecionarPrograma(programaId);
    navigate(rota);
  }

  function mudarTema() {
    setTema(alternarTema());
  }

  function sair() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="programas-pagina">
      <header className="programas-topo">
        <strong className="programas-logo">SENAI</strong>

        <div className="programas-topo-acoes">
          <span className="programas-usuario">
            <strong>{usuario?.nome}</strong>
            <small>{usuario?.perfil}</small>
          </span>

          <button type="button" onClick={mudarTema} aria-label="Alternar tema" title="Alternar tema">
            {tema === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          <button type="button" onClick={sair} aria-label="Sair da conta" title="Sair da conta">
            <FiLogOut />
          </button>
        </div>
      </header>

      <section className="programas-conteudo">
        <div className="programas-introducao">
          <span>Portal de sistemas</span>
          <h1>Qual programa você deseja acessar?</h1>
          <p>Os programas disponíveis são definidos pelas permissões do seu perfil.</p>
        </div>

        <div className="programas-grid">
          {programasPermitidos.map((programa) => (
            <article className="programa-card" key={programa.id}>
              <div className="programa-icone"><FiBox /></div>
              <div className="programa-card-conteudo">
                <span>Sistema de gerenciamento</span>
                <h2>{programa.nome}</h2>
                <p>{programa.descricao}</p>
              </div>
              <button
                type="button"
                onClick={() => acessarPrograma(programa.id, programa.rotaInicial)}
              >
                Acessar programa
                <FiArrowRight />
              </button>
            </article>
          ))}

          {programasPermitidos.length === 0 && (
            <div className="programas-vazio">
              Nenhum programa está disponível para o seu perfil.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
