import { NavLink } from "react-router-dom";
import {
  FiArchive,
  FiBarChart2,
  FiChevronDown,
  FiClipboard,
  FiFileText,
  FiHome,
  FiSettings,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";

import "./Sidebar.css";

const itensMenu = [
  { icone: <FiHome />, titulo: "Dashboard", caminho: "/dashboard" },
  { icone: <FiFileText />, titulo: "Demandas", caminho: "/demandas" },
  { icone: <FiClipboard />, titulo: "Checklists", caminho: "/checklists" },
  { icone: <FiArchive />, titulo: "Almoxarifado", caminho: "/almoxarifado" },
  { icone: <FiShoppingCart />, titulo: "Compras", caminho: "/compras" },
  { icone: <FiBarChart2 />, titulo: "Relatórios", caminho: "/relatorios" },
  { icone: <FiUsers />, titulo: "Usuários", caminho: "/usuarios" },
  { icone: <FiSettings />, titulo: "Configurações", caminho: "/configuracoes" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <h1>SENAI</h1>
          <span>AUTOMOTIVO</span>
          <span>CAXIAS DO SUL</span>
        </div>

        <nav className="sidebar-menu">
          {itensMenu.map((item) => (
            <NavLink
              key={item.titulo}
              to={item.caminho}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              {item.icone}
              <span>{item.titulo}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="avatar">JP</div>

        <div className="sidebar-user-info">
          <strong>João Pedro</strong>
          <span>Coordenador</span>
        </div>

        <FiChevronDown className="sidebar-user-arrow" />
      </div>
    </aside>
  );
}