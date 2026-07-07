import { FiMenu, FiLogOut, FiMoon } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

type HeaderProps = {
  titulo?: string;
};

export default function Header({ titulo = "Dashboard" }: HeaderProps) {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const navigate = useNavigate();

  function abrirMenuMobile() {
    window.dispatchEvent(new CustomEvent("abrir-menu-mobile"));
  }

  function alternarModoEscuro() {
    document.documentElement.classList.toggle("dark");
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
        >
          JC
        </button>

        {perfilAberto && (
          <div className="header-profile-card">
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