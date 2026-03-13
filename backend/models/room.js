const db = require("../config/db");

const createRoom = (room, callback) => {

    const query = "INSERT INTO rooms (tournament_id, created_by) VALUES (?, ?)";

    db.query(query, [room.tournamentId, room.userId], callback);

};

module.exports = { createRoom };