const express = require("express");
const router = express.Router();

const authController = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/authmiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.profile);

module.exports = router;