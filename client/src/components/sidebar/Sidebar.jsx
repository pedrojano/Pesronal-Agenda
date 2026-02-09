import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiCalendar, FiUser, FiLogOut } from "react-icons/fi";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("userName");
  
    navigate("/");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Agenda Pro
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">
          <FiHome size={20} />
          <span>Dashboard</span>
        </NavLink>

        
        {/* Aqui vai entrar o link para o Agente virutal  */}
        

        <NavLink to="/agenda" className="nav-link">
          <FiCalendar size={20} />
          <span>Agenda</span>
        </NavLink>

        <NavLink to="/profile" className="nav-link">
          <FiUser size={20} />
          <span>Perfil</span>
        </NavLink>
      </nav>

      <button onClick={handleLogout} className="logout-btn">
        <FiLogOut />
        <span>Sair</span>
      </button>
    </aside>
  );
}