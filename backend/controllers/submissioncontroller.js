const submissions = [];

// Submit Code
exports.submitCode = async (req, res) => {

    const { problemId, code, language } = req.body;
    const userId = req.user.id;

    try {

        // Simulated code execution result
        const result = {
            status: "Accepted",
            runtime: "0.12s"
        };

        const submission = {
            id: Date.now(),
            userId,
            problemId,
            code,
            language,
            result,
            submittedAt: new Date()
        };

        submissions.push(submission);

        res.json({
            message: "Code submitted successfully",
            submission
        });

    } catch (error) {

        res.status(500).json({
            message: "Submission failed"
        });

    }
};


// Get All Submissions of User
exports.getUserSubmissions = (req, res) => {

    const userId = req.user.id;

    const userSubmissions = submissions.filter(
        sub => sub.userId === userId
    );

    res.json({
        submissions: userSubmissions
    });

};


// Get Submission by ID
exports.getSubmissionById = (req, res) => {

    const id = parseInt(req.params.id);

    const submission = submissions.find(
        sub => sub.id === id
    );

    if (!submission) {
        return res.status(404).json({
            message: "Submission not found"
        });
    }

    res.json({
        submission
    });

};