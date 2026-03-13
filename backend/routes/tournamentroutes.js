const express = require("express");
const router = express.Router();

const tournamentController = require("../controllers/tournamentcontroller");
const authMiddleware = require("../middleware/authmiddleware");

router.post("/", authMiddleware, tournamentController.createTournament);

router.get("/", tournamentController.getTournaments);

router.get("/:id", tournamentController.getTournamentById);

router.post("/join/:id", authMiddleware, tournamentController.joinTournament);

module.exports = router;