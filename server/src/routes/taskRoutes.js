const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const jwt = require("jsonwebtoken");


function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
  
    return res.status(401).json({ error: "Acesso negado!" });
  }

  try {
   
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    
    console.error(" Erro na verificação:", err.message);
    res.status(400).json({ error: "Token inválido: " });
  }
}


router.post("/", verifyToken, taskController.createTask);
router.get("/", verifyToken, taskController.getTasks);
router.get("/metrics", verifyToken, taskController.getMetrics);
router.put("/:id", verifyToken, taskController.updateTask);
router.delete("/:id", verifyToken, taskController.deleteTask);

module.exports = router;
