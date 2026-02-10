const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const db = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const userRoutes = require("./src/routes/userRoutes");
const aiRoutes = require("./src/routes/aiRoutes");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Servidor Agenda Pro está rodando!");
});

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
