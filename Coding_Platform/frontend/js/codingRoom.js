/**
 * CodingRoom.js - Coding Arena Main Logic
 * Handles problem display, timer, language selection, and code submission
 */

class CodingRoomManager {
    constructor() {
        this.tournamentId = this.getParamFromURL('tournament');
        this.problemId = this.getParamFromURL('problem');
        this.problem = null;
        this.code = '';
        this.language = 'javascript';
        this.timeRemaining = 120 * 60; // 2 hours in seconds
        this.timerInterval = null;
        this.isSubmitting = false;
        this.init();
    }

    /**
     * Get parameter from URL
     */
    getParamFromURL(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    }

    /**
     * Initialize coding room
     */
    async init() {
        requireAuth();
        updateUserUI();
        
        await this.loadProblem();
        this.setupEventListeners();
        this.startTimer();
        this.initEditor();
        this.initRealTimeLeaderboard();
    }

    /**
     * Load problem details
     */
    async loadProblem() {
        try {
            // Mock problem data (replace with API call)
            this.problem = {
                id: this.problemId || 1,
                title: 'Two Sum',
                difficulty: 'easy',
                acceptance: 75,
                description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.
                
You may assume that each input has exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`,
                input: 'An array of integers and a target integer',
                output: 'Two indices of numbers that sum to target',
                constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
                examples: [
                    {
                        input: 'nums = [2,7,11,15], target = 9',
                        output: '[0,1]',
                        explanation: 'nums[0] + nums[1] == 9, return [0, 1]'
                    },
                    {
                        input: 'nums = [3,2,4], target = 6',
                        output: '[1,2]',
                        explanation: 'nums[1] + nums[2] == 6, return [1, 2]'
                    }
                ]
            };

            this.renderProblem();
        } catch (error) {
            console.error('Error loading problem:', error);
        }
    }

    /**
     * Render problem statement
     */
    renderProblem() {
        const p = this.problem;

        document.getElementById('problemTitle').textContent = p.title;
        document.getElementById('problemDifficulty').textContent = p.difficulty.toUpperCase();
        document.getElementById('problemAcceptance').textContent = `${p.acceptance}% Accepted`;
        document.getElementById('problemDescription').textContent = p.description;
        document.getElementById('problemInput').textContent = p.input;
        document.getElementById('problemOutput').textContent = p.output;
        document.getElementById('problemConstraints').textContent = p.constraints;

        // Render examples
        const examplesContainer = document.getElementById('examplesContainer');
        examplesContainer.innerHTML = (p.examples || [])
            .map((ex, idx) => `
                <div class="example-item">
                    <div class="example-label">Example ${idx + 1}:</div>
                    <div class="example-code">Input: ${ex.input}</div>
                    <div class="example-code" style="margin-top: 0.5rem;">Output: ${ex.output}</div>
                    <div style="color: #888; font-size: 0.875rem; margin-top: 0.5rem;">Explanation: ${ex.explanation}</div>
                </div>
            `)
            .join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const runBtn = document.getElementById('runCodeBtn');
        const submitBtn = document.getElementById('submitCodeBtn');
        const languageSelect = document.getElementById('languageSelect');
        const formatBtn = document.getElementById('formatCodeBtn');
        const clearBtn = document.getElementById('clearCodeBtn');
        const leaderboardRefreshBtn = document.getElementById('leaderboardRefreshBtn');

        runBtn?.addEventListener('click', () => this.handleRunCode());
        submitBtn?.addEventListener('click', () => this.handleSubmitCode());
        languageSelect?.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
        formatBtn?.addEventListener('click', () => this.handleFormatCode());
        clearBtn?.addEventListener('click', () => this.handleClearCode());
        leaderboardRefreshBtn?.addEventListener('click', () => this.refreshLeaderboard());
    }

    /**
     * Initialize Monaco Editor
     */
    initEditor() {
        // Editor will be initialized by editor.js
        // This is a placeholder for integration
    }

    /**
     * Start contest timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimerEnd();
            }
        }, 1000);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;

        const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('contestTimer').textContent = display;
    }

    /**
     * Handle timer end
     */
    handleTimerEnd() {
        alert('Time\'s up! Your code has been automatically submitted.');
        this.handleSubmitCode();
    }

    /**
     * Handle language change
     */
    handleLanguageChange(language) {
        this.language = language;
        // Editor will handle language switching
    }

    /**
     * Handle run code
     */
    async handleRunCode() {
        try {
            const runBtn = document.getElementById('runCodeBtn');
            runBtn.disabled = true;

            // Get code from editor (supports Monaco or fallback)
            const code = (typeof monacoEditor !== 'undefined' && monacoEditor) 
                ? monacoEditor.getCode()
                : (document.getElementById('codeEditorFallback')?.value || '');

            const response = await api.runCode(this.problemId, code, this.language);

            // Display results
            const noTestsMsg = document.getElementById('noTestsRun');
            const testResults = document.getElementById('testResults');
            const testDetails = document.getElementById('testResultsDetails');
            
            if (noTestsMsg) noTestsMsg.style.display = 'none';
            if (testResults) testResults.style.display = 'block';
            if (testDetails) {
                testDetails.innerHTML = `
                    <div class="test-result-item ${response.passed ? 'passed' : 'failed'}">
                        <span class="test-icon">${response.passed ? '✓' : '✗'}</span>
                        <span id="testResultText">${response.message || 'Test completed'}</span>
                    </div>
                `;
            }
        } catch (error) {
            alert('Error running code: ' + error.message);
        } finally {
            const runBtn = document.getElementById('runCodeBtn');
            runBtn.disabled = false;
        }
    }

    /**
     * Handle submit code
     */
    async handleSubmitCode() {
        if (this.isSubmitting) return;

        try {
            this.isSubmitting = true;
            const submitBtn = document.getElementById('submitCodeBtn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            // Get code from editor (supports Monaco or fallback)
            const code = (typeof monacoEditor !== 'undefined' && monacoEditor) 
                ? monacoEditor.getCode()
                : (document.getElementById('codeEditorFallback')?.value || '');

            const response = await api.submitCode(this.problemId, code, this.language);

            // Show submission message
            const message = document.getElementById('submissionFeedback');
            if (message) {
                message.style.display = 'block';
                message.textContent = response.message || 'Code submitted successfully!';
                message.classList.remove('error');
            }

            // Refresh leaderboard
            setTimeout(() => this.refreshLeaderboard(), 1000);
        } catch (error) {
            const message = document.getElementById('submissionFeedback');
            if (message) {
                message.style.display = 'block';
                message.textContent = 'Submission failed: ' + error.message;
                message.classList.add('error');
            }
        } finally {
            this.isSubmitting = false;
            const submitBtn = document.getElementById('submitCodeBtn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Code';
        }
    }

    /**
     * Handle format code
     */
    handleFormatCode() {
        if (typeof monacoEditor !== 'undefined' && monacoEditor) {
            monacoEditor.formatCode();
        }
    }

    /**
     * Handle clear code
     */
    handleClearCode() {
        if (confirm('Are you sure you want to clear all code?')) {
            if (typeof monacoEditor !== 'undefined' && monacoEditor) {
                monacoEditor.clearCode();
            } else {
                const fallback = document.getElementById('codeEditorFallback');
                if (fallback) {
                    fallback.value = '';
                }
            }
        }
    }

    /**
     * Refresh leaderboard
     */
    refreshLeaderboard() {
        // Fetch and update leaderboard data
        this.loadLeaderboardData();
    }

    /**
     * Initialize real-time leaderboard
     */
    initRealTimeLeaderboard() {
        // Load initial leaderboard data
        this.loadLeaderboardData();

        // Listen for real-time updates from WebSocket
        if (typeof wsManager !== 'undefined' && wsManager) {
            // Leaderboard update event
            wsManager.addEventListener('leaderboard:update', (event) => {
                this.updateLeaderboardRow(event.detail);
            });

            // Submission result event
            wsManager.addEventListener('submission:result', (event) => {
                const result = event.detail;
                console.log('Submission result received:', result);
                // Refresh leaderboard after submission
                setTimeout(() => this.loadLeaderboardData(), 500);
            });

            // Connection status change
            wsManager.addEventListener('connection:open', () => {
                console.log('✅ Connection established');
                this.loadLeaderboardData();
            });

            wsManager.addEventListener('connection:close', () => {
                console.log('❌ Connection lost');
            });
        } else {
            console.warn('WebSocket manager not available');
        }
    }

    /**
     * Load leaderboard data
     */
    async loadLeaderboardData() {
        try {
            const leaderboardBody = document.getElementById('leaderboardBody');
            if (!leaderboardBody) return;

            // Show loading state
            const loading = document.getElementById('leaderboardLoading');
            if (loading) loading.style.display = 'flex';

            // Mock leaderboard data
            const leaderboard = this.getMockLeaderboard(10);

            // Render leaderboard rows
            leaderboardBody.innerHTML = leaderboard
                .map((player, idx) => {
                    const rankClass = idx < 3 
                        ? `rank-badge ${['first', 'second', 'third'][idx]}`
                        : `rank-badge other`;

                    return `
                        <tr class="leaderboard-row" data-user-id="${player.userId}">
                            <td class="rank-cell">
                                <span class="${rankClass}">${idx + 1}</span>
                            </td>
                            <td class="name-cell">${player.username}</td>
                            <td class="score-cell">${player.score}</td>
                            <td class="time-cell">${player.timeSpent || '--'}</td>
                        </tr>
                    `;
                })
                .join('');

            // Update your rank
            const user = getCurrentUser();
            if (user) {
                const userRank = leaderboard.findIndex(p => p.userId === parseInt(user.id)) + 1;
                const yourRankEl = document.getElementById('yourRank');
                if (yourRankEl) {
                    yourRankEl.textContent = userRank > 0 ? `#${userRank}` : '--';
                }

                const userScore = leaderboard.find(p => p.userId === parseInt(user.id));
                if (userScore) {
                    const yourScoreEl = document.getElementById('yourScore');
                    if (yourScoreEl) {
                        yourScoreEl.textContent = userScore.score;
                    }
                }
            }

            if (loading) loading.style.display = 'none';
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
    }

    /**
     * Get mock leaderboard data
     */
    getMockLeaderboard(count = 10) {
        const players = [];
        for (let i = 1; i <= count; i++) {
            players.push({
                rank: i,
                userId: i,
                username: `Coder${i}`,
                score: Math.max(100, 1000 - (i * 50)),
                timeSpent: `${Math.floor(Math.random() * 90)}m`
            });
        }
        return players;
    }

    /**
     * Update leaderboard row in real-time
     */
    updateLeaderboardRow(data) {
        const row = document.querySelector(`[data-user-id="${data.userId}"]`);
        if (row) {
            row.classList.add('player-row-highlight');
            const scoreCell = row.querySelector('.score-cell');
            if (scoreCell) {
                scoreCell.textContent = data.score;
            }
            
            // Remove highlighting after animation
            setTimeout(() => {
                row.classList.remove('player-row-highlight');
            }, 2000);
        }
    }

    /**
     * Handle leaderboard changes
     */
    handleLeaderboardChange(data) {
        // Refresh entire leaderboard on submission
        this.loadLeaderboardData();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new CodingRoomManager();
});