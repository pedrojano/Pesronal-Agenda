const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const pool = require("../config/db");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor preencha os campos obrigatorios" });
    }

    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "E-mail ja cadastrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );
    const token = jwt.sign(
      {
        id: newUser.rows[0].id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Usuario criado com sucesso!",
      user: newUser.rows[0],
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "E-mail ou senha inválidos." });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ error: "Esta conta usa login social (Google)." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    delete user.password;

    res.json({
      message: "Login realizado!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token,
    });
  } catch (error) {
    console.error("Erro no Login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

exports.googleLogin = async (req, res) => {
  const { access_token } = req.body;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const { sub: googleId, name, email, picture } = response.data;

    const userCheck = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let user;

    if (userCheck.rows.length > 0) {
      user = userCheck.rows[0];

      if (!user.google_id || !user.avatar_url) {
        await db.query(
          "UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3",
          [googleId, picture, user.id]
        );
      }
    } else {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = await db.query(
        "INSERT INTO users (name, email, password, google_id, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, email, hashedPassword, googleId, picture]
      );
      user = newUser.rows[0];
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login Google realizado!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: picture,
      },
    });
  } catch (error) {
    console.error("Erro Google Auth:", error.message);
    res.status(400).json({ error: "Falha na autenticação Google" });
  }
};
