const db = require("../config/db");

const saveSubmission = (submission, callback) => {

    const query = "INSERT INTO submissions (user_id, problem_id, code, language, result) VALUES (?, ?, ?, ?, ?)";

    db.query(
        query,
        [submission.userId, submission.problemId, submission.code, submission.language, submission.result],
        callback
    );

};

module.exports = { saveSubmission };