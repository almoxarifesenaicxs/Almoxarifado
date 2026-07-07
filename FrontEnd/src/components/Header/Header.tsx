import { FiMenu, FiLogOut, FiMoon } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

type HeaderProps = {
  titulo?: string;
};

function obterUsuarioLogado() {
  const usuarioSalvo = localStorage.getItem("@senai:user");

  if (!usuarioSalvo) {
    return { nome: "Usuario", perfil: "" };
  }

  try {
    return JSON.parse(usuarioSalvo) as { nome: string; perfil?: string };
  } catch {
    return { nome: "Usuario", perfil: "" };
  }
}

function gerarIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Header({ titulo = "Dashboard" }: HeaderProps) {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const navigate = useNavigate();
  const usuario = obterUsuarioLogado();

  function abrirMenuMobile() {
    window.dispatchEvent(new CustomEvent("abrir-menu-mobile"));
  }

  function alternarModoEscuro() {
    const darkAtivo = document.documentElement.classList.toggle("dark");
    localStorage.setItem("@senai:theme", darkAtivo ? "dark" : "light");
    setPerfilAberto(false);
  }

  function sair() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-title">
        <button
          type="button"
          className="header-menu-button"
          onClick={abrirMenuMobile}
        >
          <FiMenu />
        </button>

        <h2>{titulo}</h2>
      </div>

      <div className="header-profile">
        <button
          type="button"
          className="header-avatar"
          onClick={() => setPerfilAberto(!perfilAberto)}
          aria-expanded={perfilAberto}
        >
          {gerarIniciais(usuario.nome)}
        </button>

        {perfilAberto && (
          <div className="header-profile-card">
            <div className="header-profile-user">
              <strong>{usuario.nome}</strong>
              {usuario.perfil && <span>{usuario.perfil}</span>}
            </div>

            <button type="button" onClick={alternarModoEscuro}>
              <FiMoon />
              Modo escuro
            </button>

            <button type="button" className="sair" onClick={sair}>
              <FiLogOut />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
