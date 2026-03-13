const db = require("../config/db");

const createTournament = (tournament, callback) => {

    const query = "INSERT INTO tournaments (title, entry_fee, start_time) VALUES (?, ?, ?)";

    db.query(query, [tournament.title, tournament.entryFee, tournament.startTime], callback);

};

module.exports = { createTournament };