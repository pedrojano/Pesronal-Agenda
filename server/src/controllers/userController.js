const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      "SELECT id, name, email, avatar_url, avatar FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, password } = req.body;
    const file = req.file;

    const userResult = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const currentUser = userResult.rows[0];

    if (!currentUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const newName = name || currentUser.name;
    const newEmail = email || currentUser.email;
    const newAvatar = file ? file.filename : currentUser.avatar;

    let newPassword = currentUser.password;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      newPassword = await bcrypt.hash(password, salt);
    }

    const updateResult = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, password = $3, avatar = $4 
       WHERE id = $5 
       RETURNING id, name, email, avatar`,
      [newName, newEmail, newPassword, newAvatar, userId],
    );

    res.json({
      message: "Perfil atualizado com sucesso!",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "E-mail já está em uso por outro usuário." });
    }
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
};
