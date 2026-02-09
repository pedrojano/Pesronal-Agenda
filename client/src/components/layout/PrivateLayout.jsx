import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import NotificationTime from "../notification/NotificationTime";
import api from "../../services/api";
import "./PrivateLayout.css";

export default function PrivateLayout() {
  const [tasks, setTasks] = useState([]);

  async function loadTasksForNotifications() {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error(
        "Erro silencioso ao buscar tarefas para notificação",
        error,
      );
    }
  }

  useEffect(() => {
    loadTasksForNotifications();

    const interval = setInterval(loadTasksForNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="layout-container">
      <NotificationTime
        events={tasks}
        onTaskUpdated={loadTasksForNotifications}
      />
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
