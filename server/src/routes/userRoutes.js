const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

router.use(authMiddleware);
router.get("/profile", authMiddleware,userController.getProfile);
router.put("/profile", authMiddleware,upload.single("avatar"), userController.updateProfile);

module.exports = router;
