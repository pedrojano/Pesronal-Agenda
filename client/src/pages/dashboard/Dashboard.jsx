import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import api from "../../services/api";

export default function Dashboard() {
  const [status, setStatus] = useState({ pending: 0, done: 0, canceled: 0 });
  const [nextTasks, setNextTasks] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Usuário");

  useEffect(() => {
    const storedName = localStorage.getItem(userName);
    if (storedName) setUserName(storedName);

    async function loadMetrics() {
      try {
        const response = await api.get("/tasks/metrics");

        setStatus(response.data.status);
        setNextTasks(response.data.nextTasks);
      } catch (error) {
        console.error("erro ao carregar metricas", error);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Olá, {userName}!</h1>
        <p>Aqui está o resumo da sua produtividade hoje.</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card card-pending">
          <h3>Pendentes</h3>
          <span className="number">{status.pending || 0}</span>
        </div>

        <div className="metric-card card-done">
          <h3>Concluídas</h3>
          <span className="number">{status.done || 0}</span>
        </div>

        <div className="metric-card card-canceled">
          <h3>Canceladas</h3>
          <span className="number">{status.canceled || 0}</span>
        </div>
      </div>

      <div className="next-tasks-section">
        <div className="section-title">
          <h2>Próximas Tarefas</h2>
          <Link to="/agenda" className="btn-agenda">
            Ver Agenda Completa
          </Link>
        </div>

        {nextTasks.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center" }}>
            Nenhuma tarefa próxima.
          </p>
        ) : (
          nextTasks.map((task) => (
            <div key={task.id} className="task-row">
              <span className="task-time">
                {new Date(task.start_time).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
                {' às '}
                {new Date(task.start_time).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {' - '}
              </span>
              <span className="task-title">{' Tarefa:'}{task.title}</span>
              <span className={`status-badge badge-${task.status}`}>
                {task.status === "done" ? "Feito" : "Pendente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
