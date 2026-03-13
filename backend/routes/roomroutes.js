const express = require("express");
const router = express.Router();

const roomController = require("../controllers/roomcontroller");
const authMiddleware = require("../middleware/authmiddleware");

router.post("/", authMiddleware, roomController.createRoom);

router.post("/join/:id", authMiddleware, roomController.joinRoom);

router.get("/:id", roomController.getRoom);

router.post("/leave/:id", authMiddleware, roomController.leaveRoom);

module.exports = router;