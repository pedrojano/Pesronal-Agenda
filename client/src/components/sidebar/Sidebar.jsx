import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiZap,
  FiMenu,
  FiChevronLeft,
} from "react-icons/fi";
import "./Sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("userName");

    navigate("/");
  }

  // return (
  //   <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
  //     <div className="sidebar-logo">Agenda Pro</div>

  //     <nav className="sidebar-nav">
  //       <NavLink to="/dashboard" className="nav-link">
  //         <FiHome size={20} />
  //         <span>Dashboard</span>
  //       </NavLink>

  //       <NavLink to="/agenteIA" className="nav-link">
  //         <FiZap size={20} />
  //         <span>Agente Inteligente</span>
  //       </NavLink>

  //       <NavLink to="/agenda" className="nav-link">
  //         <FiCalendar size={20} />
  //         <span>Agenda</span>
  //       </NavLink>

  //       <NavLink to="/profile" className="nav-link">
  //         <FiUser size={20} />
  //         <span>Perfil</span>
  //       </NavLink>
  //     </nav>

  //     <button onClick={handleLogout} className="logout-btn">
  //       <FiLogOut />
  //       <span>Sair</span>
  //     </button>
  //   </aside>
  // );
  return (
    // A classe muda dinamicamente: 'sidebar open' ou 'sidebar closed'
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      
      {/* Cabeçalho: Logo + Botão de Toggle */}
      <div className="sidebar-header">
        {/* Mostra o logo apenas se estiver aberto */}
        <div className={`sidebar-logo ${!isOpen && "hidden"}`}>
          Agenda Pro
        </div>
        
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiChevronLeft size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
            to="/dashboard" 
            className="nav-link"
            title={!isOpen ? "Dashboard" : ""} // Tooltip nativo quando fechado
        >
          <FiHome size={22} />
          <span className="link-text">Dashboard</span>
        </NavLink>

        <NavLink to="/agenteIA" className="nav-link" title={!isOpen ? "Agente IA" : ""}>
          <FiZap size={22} />
          <span className="link-text">Agente IA</span>
        </NavLink>
        
        <NavLink to="/agenda" className="nav-link" title={!isOpen ? "Agenda" : ""}>
          <FiCalendar size={22} />
          <span className="link-text">Agenda</span>
        </NavLink>

        <NavLink to="/profile" className="nav-link" title={!isOpen ? "Perfil" : ""}>
          <FiUser size={22} />
          <span className="link-text">Perfil</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-link logout-btn" title={!isOpen ? "Sair" : ""}>
          <FiLogOut size={22} />
          <span className="link-text">Sair</span>
        </button>
      </div>
    </aside>
  );
}
