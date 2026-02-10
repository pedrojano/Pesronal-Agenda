import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AgenteIA.css";

import Swal from "sweetalert2";

import {
  FiCpu,
  FiArrowRight,
  FiBell,
  FiZap,
  FiCalendar,
  FiCheck,
} from "react-icons/fi";

export default function AgenteIA() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const navigate = useNavigate();

  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const response = await api.post("/api/ai/generate-schedule", {
        routineText: input,
      });

      const safeSchedule = response.data.schedule || [];
      setSchedule(safeSchedule);

      if (safeSchedule.length === 0) {
        Swal.fire(
          "Atenção",
          "A IA não conseguiu identificar tarefas no seu texto.",
          "warning",
        );
      }
    } catch (error) {
      console.error(error);
      setSchedule([]);
      Swal.fire("Erro", "Falha na comunicação com a IA.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAndGo() {
    try {
      const promises = schedule.map((task) => {
        return api.post("/tasks", {
          title: task.title,
          description: task.description,
          start_time: task.start_time,
          end_time: task.end_time,
          notify: task.notify,
        });
      });

      await Promise.all(promises);

      Swal.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Sua agenda foi criada automaticamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/agenda");
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Não foi possível salvar a agenda.", "error");
    }
  }

  const formatTime = (dateTimeString) => {
    if (!dateTimeString || typeof dateTimeString !== "string") return "--:--";
    try {
      return dateTimeString.split(" ")[1] || dateTimeString;
    } catch (e) {
      return "--:--";
    }
  };

  return (
    <div className="ai-dashboard">
      <aside className="ai-sidebar">
        <div>
          <header className="ai-header">
            <h1>
              <FiZap style={{ color: "#6366f1" }} /> Agente Inteligente de
              Rotina
            </h1>
            <p>
              Descreva seus objetivos do dia e eu organizo os horários ideais
              para você.
            </p>
          </header>

          <div className="input-wrapper">
            <label>Como será o seu dia?</label>
            <textarea
              className="ai-textarea"
              placeholder="Ex: Trabalho das 9h às 18h. Preciso de 1h de almoço. Quero ir na academia à noite e estudar inglês por 30min..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={loading || !input}
        >
          {loading
            ? "Processando Inteligência..."
            : "Gerar Cronograma Otimizado"}
        </button>
      </aside>

      <main className="ai-results">
        {schedule.length === 0 ? (
          <div className="empty-state">
            <FiCalendar className="empty-icon" />
            <h3>Aguardando instruções</h3>
            <p>Seu cronograma inteligente aparecerá aqui.</p>
          </div>
        ) : (
          <div className="timeline-container">
            <div className="timeline-header">
              <h3>Cronograma Sugerido ({schedule.length} itens)</h3>
            </div>

            {schedule.map((task, index) => (
              <div key={index} className="timeline-item">
                <div className="time-badge">
                  <span className="time-start">
                    {formatTime(task.start_time)}
                  </span>
                  <span className="time-end">{formatTime(task.end_time)}</span>
                </div>

                <div className="timeline-dot"></div>

                <div className="task-card">
                  <div className="card-top">
                    <h4>{task.title}</h4>
                    {task.notify && (
                      <FiBell className="icon-bell" title="Notificação Ativa" />
                    )}
                  </div>
                  <p>{task.description}</p>
                </div>
              </div>
            ))}

            <button className="btn-confirm-floating" onClick={handleSaveAndGo}>
              <FiCheck /> Confirmar Agenda
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
