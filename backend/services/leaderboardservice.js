exports.calculateLeaderboard = (submissions) => {

    const leaderboard = {};

    submissions.forEach(sub => {

        if (!leaderboard[sub.userId]) {
            leaderboard[sub.userId] = 0;
        }

        leaderboard[sub.userId] += sub.score || 0;

    });

    return Object.entries(leaderboard)
        .map(([userId, score]) => ({ userId, score }))
        .sort((a, b) => b.score - a.score);

};