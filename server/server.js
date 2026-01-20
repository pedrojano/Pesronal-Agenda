const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./src/config/db");
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send('Servidor Agenda Pro está rodando!');
});


app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
