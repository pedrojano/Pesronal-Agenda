const db = require("../config/db");

exports.createTask = async (req, res) => {
  const { title, description, start_time, end_time, notify } = req.body;
  const userId = req.user.id;

  try {
    if (!title || !start_time || !end_time) {
      return res.status(400).json({
        error: "Titulo, Inicio e Fim são obrigatórios",
      });
    }

    const newTask = await db.query(
      `INSERT INTO tasks (title, description, start_time, end_time, notify, user_id, status) VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [title, description, start_time, end_time, notify || false, userId]
    );

    res.status(201).json({
      message: "Tarefa criada com sucesso",
      task: newTask.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    res.status(500).json({ error: "Erro interno ao criar terefa" });
  }
};

exports.getTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const tasks = await db.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY start_time ASC`,
      [userId]
    );
    res.json(tasks.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao buscar tarefas",
    });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, notify } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `UPDATE tasks 
       SET title = $1, description = $2, start_time = $3, end_time = $4, notify = $5 
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [title, description, start_time, end_time, notify, id, userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Tarefa não encontrada ou sem permissão." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).json({ error: "Erro interno ao atualizar." });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.status(200).json({ message: "Tarefa deletada com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar tarefa", error);
    res.status(500).json({ error: "Erro interno ao deletar tarefa" });
  }
};

exports.getMetrics = async (req, res) => {
  const userId = req.user.id;

  try {
    const metrics = await db.query(
      "SELECT status, COUNT(*) as count FROM tasks WHERE user_id = $1 GROUP BY status",
      [userId]
    );

    const formattedStats = { pending: 0, done: 0, rescheduled: 0, canceled: 0 };
    metrics.rows.forEach((row) => {
      formattedStats[row.status] = parseInt(row.count);
    });
    const nextTasks = await db.query(
      "SELECT id, title, start_time, status FROM tasks WHERE user_id = $1 AND start_time >= NOW() ORDER BY start_time ASC LIMIT 5",
      [userId]
    );

    res.json({
      status: formattedStats,
      nextTasks: nextTasks.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar métricas", error);
    res.status(500).json({ error: "Erro ao buscar métricas" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const validStatuses = ["pending", "done", "rescheduled", "canceled"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  try {
    const result = await db.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [status, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar status da tarefa" });
  }
};
