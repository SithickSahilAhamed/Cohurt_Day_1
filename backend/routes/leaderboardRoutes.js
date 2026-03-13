const express = require("express");
const router = express.Router();

const leaderboardController = require("../controllers/leaderboardcontroller");
const authMiddleware = require("../middleware/authmiddleware");

router.post("/update", authMiddleware, leaderboardController.updateLeaderboard);

router.get("/:tournamentId", leaderboardController.getLeaderboard);

router.get("/rank/:tournamentId", authMiddleware, leaderboardController.getUserRank);

module.exports = router;