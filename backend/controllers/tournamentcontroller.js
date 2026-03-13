const tournaments = [];
const participants = [];

// Create Tournament
exports.createTournament = (req, res) => {

    const { title, entryFee, startTime, duration } = req.body;

    const newTournament = {
        id: Date.now(),
        title,
        entryFee,
        startTime,
        duration
    };

    tournaments.push(newTournament);

    res.json({
        message: "Tournament created successfully",
        tournament: newTournament
    });

};


// Get All Tournaments
exports.getTournaments = (req, res) => {

    res.json({
        tournaments
    });

};


// Get Single Tournament
exports.getTournamentById = (req, res) => {

    const id = parseInt(req.params.id);

    const tournament = tournaments.find(t => t.id === id);

    if (!tournament) {
        return res.status(404).json({
            message: "Tournament not found"
        });
    }

    res.json({
        tournament
    });

};


// Join Tournament
exports.joinTournament = (req, res) => {

    const userId = req.user.id;
    const tournamentId = parseInt(req.params.id);

    const tournament = tournaments.find(t => t.id === tournamentId);

    if (!tournament) {
        return res.status(404).json({
            message: "Tournament not found"
        });
    }

    participants.push({
        userId,
        tournamentId
    });

    res.json({
        message: "Joined tournament successfully"
    });

};