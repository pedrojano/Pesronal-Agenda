const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/metrics", taskController.getMetrics);
router.put("/:id", taskController.updateTask);
router.patch("/:id", taskController.updateTaskStatus); // Atualiza só o status
router.delete("/:id", taskController.deleteTask);

module.exports = router;
