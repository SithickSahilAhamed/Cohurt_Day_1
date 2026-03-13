const express = require("express");
const router = express.Router();

const submissionController = require("../controllers/submissiononctroller");
const authMiddleware = require("../middleware/authmiddleware");

router.post("/", authMiddleware, submissionController.submitCode);

router.get("/my", authMiddleware, submissionController.getUserSubmissions);

router.get("/:id", submissionController.getSubmissionById);

module.exports = router;