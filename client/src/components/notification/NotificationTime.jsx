import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

const NotificationTime = ({ events, onTaskUpdated }) => {
  const notifiedStart = useRef(new Set());
  const notifiedEnd = useRef(new Set());

  const isAlertOpen = useRef(false);

  useEffect(() => {
    const checkTime = async () => {
      if (isAlertOpen.current) return;

      const now = new Date();

      if (!events || events.length === 0) return;
      for (const task of events) {
        if (task.status !== "pending") continue;

        const rawStart = task.start_time || task.start;
        const rawEnd = task.end_time || task.end;
        const startTime = new Date(rawStart);
        const endTime = new Date(rawEnd);

        if (isNaN(startTime.getTime())) continue;

        const taskId = task.id;
        const startKey = `${taskId}-${startTime.getTime()}-start`;
        const endKey = `${taskId}-${endTime.getTime()}-end`;

        const diffMs = startTime - now;
        const minutesUntilStart = Math.floor(diffMs / 60000);

        if (minutesUntilStart <= 10 && minutesUntilStart >= -2) {
          if (!notifiedStart.current.has(startKey)) {
            isAlertOpen.current = true;
            notifiedStart.current.add(startKey);
            playNotificationSound();

            const horaFormatada = startTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            await Swal.fire({
              title: `Preparado?`,
              html: `A tarefa <b>"${task.title}"</b> começa às ${horaFormatada}.<br>pode confirmar ou precisa reagendar?`,
              icon: "info",
              showDenyButton: true,
              showCancelButton: true,
              confirmButtonText: "Tudo certo",
              denyButtonText: "Reagendar",
              cancelButtonText: "Cancelar agora",
              confirmButtonColor: "#3085d6",
              denyButtonColor: "#f39c12",
              cancelButtonColor: "#d33",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(async (result) => {
              if (result.isConfirmed) {
              } else if (result.isDenied) {
                await handleReschedule(task, onTaskUpdated);
              } else if (result.dismiss === Swal.DismissReason.cancel) {
                await handleCancel(task, onTaskUpdated);
              }
            });

            isAlertOpen.current = false;

            return;
          }
        }

        if (now > endTime) {
          if (!notifiedEnd.current.has(endKey)) {
            isAlertOpen.current = true;
            notifiedEnd.current.add(endKey);
            playNotificationSound();

            await Swal.fire({
              title: `Fim do tempo!`,
              text: `A tarefa "${task.title}" terminou. Qual foi o resultado?`,
              icon: "question",
              showDenyButton: true,
              showCancelButton: false,
              confirmButtonText: "Concluída (Feita)",
              denyButtonText: "Não fiz (Cancelar)",
              confirmButtonColor: "#48bb78",
              denyButtonColor: "#e53e3e",
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(async (result) => {
              if (result.isConfirmed) {
                await handleComplete(task, onTaskUpdated);
              } else if (result.isDenied) {
                await handleCancel(task, onTaskUpdated);
              }
            });

            isAlertOpen.current = false;

            return;
          }
        }
      }
    };

    const interval = setInterval(checkTime, 5000);
    checkTime();

    return () => clearInterval(interval);
  }, [events, onTaskUpdated]);

  return null;
};

const playNotificationSound = () => {
  const audio = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  );
  audio.play().catch(() => {});
};

//Completar
async function handleComplete(task, callback) {
  try {
    await api.patch(`/tasks/${task.id}`, { status: "done" });
    Swal.fire("Boa!", "Tarefa concluída.", "success");
    if (callback) callback();
  } catch (error) {
    Swal.fire("Erro", "Erro ao salvar.", "error");
  }
}
// Cancelar
async function handleCancel(task, callback) {
  try {
    await api.patch(`/tasks/${task.id}`, { status: "canceled" });
    Swal.fire("Ok", "Cancelada.", "info");
    if (callback) callback();
  } catch (error) {
    Swal.fire("Erro", "Erro ao cancelar.", "error");
  }
}

// Reagendar
async function handleReschedule(task, callback) {
  const { value: newDate } = await Swal.fire({
    title: "Para quando?",
    html: '<input type="datetime-local" id="swal-input-date" class="swal2-input">',
    focusConfirm: false,
    preConfirm: () => document.getElementById("swal-input-date").value,
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
        status: "pending",
      });

      Swal.fire("Reagendado!", "Atualizado.", "success");
      if (callback) callback();
    } catch (error) {
      Swal.fire("Erro", "Falha ao reagendar.", "error");
    }
  }
}

export default NotificationTime;
