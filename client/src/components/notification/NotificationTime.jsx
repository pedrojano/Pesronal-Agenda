import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

const NotificationTime = ({ events, onTaskUpdated }) => {
  const notifiedTasks = useRef(new Map());

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();

      events.forEach((task) => {
        if (task.resource?.status === "cancelada") return;
        if (!task.resource?.notify) return;

        const timeDiff = task.start - now;
        const minutesUntil = Math.floor(timeDiff / 60000);

        const horaFormatada = new Date(task.start).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const taskSignature = `${task.id}-${task.start.getTime()}`;

        if (minutesUntil <= 10 && minutesUntil >= 0) {
          if (notifiedTasks.current.has(taskSignature)) return;

          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
          );
          audio.play().catch(() => {});

          if (window.Notification.permission === "granted") {
            new window.Notification(`${horaFormatada} - ${task.title}`, {

              body: `Começa em ${minutesUntil} minutos, clique para opções.`,
              icon: '/vite.svg',
              requireInteraction: true
            });
          }

          Swal.fire({
            title: ` ${task.title}`,
            text: `Sua tarefa está agendada para ${horaFormatada}, O que deseja fazer?`,
            icon: "question",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "✅ Vou fazer",
            denyButtonText: "📅 Reagendar",
            cancelButtonText: "❌ Cancelar Tarefa",
            cancelButtonColor: "#d33",
            denyButtonColor: "#f39c12",
            confirmButtonColor: "#3085d6",
            allowOutsideClick: false,
          }).then(async (result) => {
            if (result.isConfirmed) {
              Swal.fire("Ótimo!", "Bom trabalho.", "success");
            } else if (result.isDenied) {
              const { value: newDate } = await Swal.fire({
                title: "Para quando?",
                html: '<input type="datetime-local" id="swal-input-date" class="swal2-input">',
                focusConfirm: false,
                preConfirm: () => {
                  return document.getElementById("swal-input-date").value;
                },
              });

              if (newDate) {
                try {
                  const start = new Date(newDate);
                  const end = new Date(start.getTime() + 60 * 60 * 1000);

                  await api.put(`/tasks/${task.id}`, {
                    title: task.title,
                    description: task.description,
                    start_time: start,
                    end_time: end,
                    notify: true,
                    status: "reagendada",
                  });

                  Swal.fire(
                    "Reagendado!",
                    "Sua agenda foi atualizada.",
                    "success"
                  );
                  if (onTaskUpdated) onTaskUpdated();
                } catch (error) {
                  Swal.fire("Erro", "Não foi possível reagendar.", "error");
                }
              }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              try {
                await api.put(`/tasks/${task.id}`, {
                  title: task.title,
                  description: task.description,
                  start_time: task.start,
                  end_time: task.end,
                  notify: false,
                  status: "cancelada",
                });

                Swal.fire(
                  "Cancelada",
                  "A tarefa foi cancelada e registrada.",
                  "error"
                );
                if (onTaskUpdated) onTaskUpdated();
              } catch (error) {
                Swal.fire("Erro", "Não foi possível cancelar.", "error");
              }
            }
          });
        }
      });
    };

    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [events, onTaskUpdated]);

  return null;
};

export default NotificationTime;
