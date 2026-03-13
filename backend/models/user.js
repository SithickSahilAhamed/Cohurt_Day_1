const db = require("../config/db");

const createUser = (user, callback) => {

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(query, [user.username, user.email, user.password], callback);

};

module.exports = { createUser };