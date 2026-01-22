const Pool = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
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
    const userResult = await Pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const currentUser = userResult.rows[0];

    if (!currentUser) {
      return res.status(400).json({ error: "Usuario não encontrado" });
    }

    const newName = name || currentUser.name;
    const newEmail = email || currentUser.email;
    const newPassword = password || currentUser.password;
    const newAvatar = file ? file.filename : currentUser.avatar;

    const updateResult = await pool.query(
      "UPDATE users SET name = $1, email = $2, password = $3, avatar = $4 WHERE id = $5 RETURNING id, name, email",
      [newName, newEmail, newPassword, newAvatar, userId],
    );

    res.json({
      message: "Perfil atualizado com sucesso!",
      user: updateResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    if(error.code === '23505'){
        return res.status(400).json({ error: 'E-mail ja cadastrado'});
    }
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
};
