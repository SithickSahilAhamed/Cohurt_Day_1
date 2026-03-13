const leaderboard = [];
const submissions = []; // normally from database

// Update Leaderboard (called after submission)
exports.updateLeaderboard = (req, res) => {

    const { tournamentId, userId, score } = req.body;

    const existing = leaderboard.find(
        entry => entry.tournamentId === tournamentId && entry.userId === userId
    );

    if (existing) {
        existing.score += score;
    } else {
        leaderboard.push({
            tournamentId,
            userId,
            score
        });
    }

    res.json({
        message: "Leaderboard updated",
        leaderboard
    });

};


// Get Leaderboard for a Tournament
exports.getLeaderboard = (req, res) => {

    const tournamentId = parseInt(req.params.tournamentId);

    const tournamentLeaderboard = leaderboard
        .filter(entry => entry.tournamentId === tournamentId)
        .sort((a, b) => b.score - a.score);

    res.json({
        leaderboard: tournamentLeaderboard
    });

};


// Get User Rank
exports.getUserRank = (req, res) => {

    const tournamentId = parseInt(req.params.tournamentId);
    const userId = req.user.id;

    const sortedLeaderboard = leaderboard
        .filter(entry => entry.tournamentId === tournamentId)
        .sort((a, b) => b.score - a.score);

    const rank = sortedLeaderboard.findIndex(
        entry => entry.userId === userId
    ) + 1;

    res.json({
        userId,
        rank
    });

};