const db = require("../config/db");

const getProblems = (callback) => {

    const query = "SELECT * FROM problems";

    db.query(query, callback);

};

module.exports = { getProblems };