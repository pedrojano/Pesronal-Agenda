import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../../services/api";
import "./TaskModal.css";

export default function TaskModal({
  isOpen,
  onClose,
  initialDate,
  onTaskCreated,
  taskToEdit,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notify, setNotify] = useState(true);

  const formatToLocalISO = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || "");
      setStartTime(formatToLocalISO(taskToEdit.start));
      setEndTime(formatToLocalISO(taskToEdit.end));
      setNotify(taskToEdit.resource?.notify || taskToEdit.notify || false);
    } else {
      setTitle("");
      setDescription("");
      setStartTime(initialDate ? formatToLocalISO(initialDate) : "");
      setEndTime(
        initialDate
          ? formatToLocalISO(
              new Date(new Date(initialDate).getTime() + 60 * 60 * 1000),
            )
          : "",
      );
      setNotify(true);
    }
  }, [taskToEdit, initialDate, isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const payload = {
        title,
        description,
        start_time: startTime,
        end_time: endTime,
        notify,
      };

      if (taskToEdit) {
        await api.put(`/tasks/${taskToEdit.id}`, payload);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Tarefa atualizada com sucesso!",
          showCloseButton: true,
          timer: 1500,
        });
      } else {
        await api.post("/tasks", payload);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Tarefa criada com sucesso!",
          showCloseButton: false,
        });
      }

      onTaskCreated();
      onClose();
    } catch (error) {
      console.error(error);
      Swal.fire(
        {
          position: "center",
          icon: "error",
          title: "Erro ao salvar tarefa!",
          showCloseButton: false,
        },
        error.response?.data?.error || error.message,
      );
    }
  }

  async function handleDelete() {
    Swal.fire({
      title: "Tem certeza que deseja excluir esta tarefa?",
      text: "Essa ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/tasks/${taskToEdit.id}`);
          Swal.fire("Tarefa excluída com sucesso!", "", "success");
          onTaskCreated();
          onClose();
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Erro ao excluir tarefa!",
            icon: "error",
          });
        }
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{taskToEdit ? "Editar Tarefa" : "Nova Tarefa"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">O que você vai fazer?</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Detalhes</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-col">
              <label htmlFor="startTime">Início</label>
              <input
                type="datetime-local"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-col">
              <label htmlFor="endTime">Fim</label>
              <input
                type="datetime-local"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="notify"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
            <label htmlFor="notify">Me lembrar 10 minutos antes</label>
          </div>

          <div className="modal-actions">
            {taskToEdit && (
              <button
                type="button"
                className="btn-delete"
                onClick={handleDelete}
              >
                Excluir
              </button>
            )}

            <div className="actions-right">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                {taskToEdit ? "Salvar" : "Agendar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
