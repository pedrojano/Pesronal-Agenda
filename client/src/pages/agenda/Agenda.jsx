import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./Agenda.css";

import TaskModal from "./components/TaskModal/TaskModal";
import NotificationTime from "../../components/notification/NotificationTime";

moment.updateLocale("pt-br", {
  months:
    "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split(
      "_"
    ),
  monthsShort: "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
  weekdays:
    "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split(
      "_"
    ),
  weekdaysShort: "Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),
  weekdaysMin: "Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),
  longDateFormat: {
    LT: "HH:mm",
    LTS: "HH:mm:ss",
    L: "DD/MM/YYYY",
    LL: "D [de] MMMM [de] YYYY",
    LLL: "D [de] MMMM [de] YYYY [às] HH:mm",
    LLLL: "dddd, D [de] MMMM [de] YYYY [às] HH:mm",
  },
});

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

export default function Agenda() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");

      const formattedEvents = response.data.map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.start_time),
        end: new Date(task.end_time),
        description: task.description,
        resource: { notify: task.notify },
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      if (error.response?.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("user_token");

    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchTasks();
    }
  }, []);

  const handleSelectSlot = ({ start }) => {
    setTaskToEdit(null);
    setSelectedDate(start);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setTaskToEdit(event);
    setShowModal(true);
  };

  const formats = {
    weekdayFormat: (date, culture, localizer) => {
      const dia = localizer.format(date, "ddd", culture);
      return dia.charAt(0).toUpperCase() + dia.slice(1).replace(".", "");
    },

    dayHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, "dddd, D [de] MMMM", culture),

    monthHeaderFormat: (date, culture, localizer) =>
      localizer.format(date, "MMMM YYYY", culture).charAt(0).toUpperCase() +
      localizer.format(date, "MMMM YYYY", culture).slice(1),
  };

  return (
    <div className="agenda-container">
      <NotificationTime events={events} onTaskUpdated={fetchTasks} />

      <header className="agenda-header">
        <h1>Minha Agenda</h1>

        <button onClick={() => navigate("/dashboard")} className="btn-back">
          Voltar ao Dashboard
        </button>
      </header>

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Lista",
            noEventsInRange: "Não há tarefas neste período.",
          }}
          formats={formats}
          culture="pt-br"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          view={view}
          date={date}
          onView={(newView) => setView(newView)}
          onNavigate={(newDate) => setDate(newDate)}
        />
      </div>

      <TaskModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialDate={selectedDate}
        onTaskCreated={fetchTasks}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
