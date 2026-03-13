/**
 * Tournament.js - Tournament Detail Page Logic
 * Handles tournament information, bracket, and joining
 */

class TournamentManager {
    constructor() {
        this.tournamentId = this.getTournamentIdFromURL();
        this.tournament = null;
        this.isLoading = false;
        this.isJoined = false;
        this.init();
    }

    /**
     * Get tournament ID from URL parameters
     */
    getTournamentIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    /**
     * Initialize tournament page
     */
    async init() {
        requireAuth();
        updateUserUI();
        
        if (!this.tournamentId) {
            this.showError('Tournament not found');
            return;
        }

        await this.loadTournament();
        this.setupEventListeners();
    }

    /**
     * Load tournament details
     */
    async loadTournament() {
        const loadingEl = document.getElementById('loadingOverlay');

        try {
            this.isLoading = true;
            loadingEl?.classList.add('active');

            // Mock data (replace with API call)
            this.tournament = this.getMockTournamentData();
            this.renderTournamentDetails();
        } catch (error) {
            console.error('Error loading tournament:', error);
            this.showError('Failed to load tournament');
        } finally {
            this.isLoading = false;
            loadingEl?.classList.remove('active');
        }
    }

    /**
     * Mock tournament data
     */
    getMockTournamentData() {
        return {
            id: this.tournamentId,
            name: 'Intermediate Battle #42',
            description: 'Challenge yourself with moderate difficulty problems. Compete against developers worldwide.',
            status: 'ongoing',
            startDate: '2026-03-13T14:00:00Z',
            endDate: '2026-03-13T16:00:00Z',
            duration: 2,
            participants: 256,
            maxParticipants: 500,
            difficulty: 'medium',
            fee: 5,
            problems: [
                { id: 1, title: 'Two Sum', difficulty: 'easy', score: 100 },
                { id: 2, title: 'Add Two Numbers', difficulty: 'medium', score: 150 },
                { id: 3, title: 'Longest Substring', difficulty: 'medium', score: 150 }
            ],
            prizes: [
                { rank: 1, amount: 500 },
                { rank: 2, amount: 300 },
                { rank: 3, amount: 100 }
            ],
            leaderboard: [
                { rank: 1, username: 'CodeMaster', score: 350, time: '45m' },
                { rank: 2, username: 'AlgoKing', score: 300, time: '55m' },
                { rank: 3, username: 'BugHunter', score: 250, time: '65m' }
            ]
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const joinBtn = document.getElementById('joinTournamentBtn');
        const enterBtn = document.getElementById('enterBattleBtn');

        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.handleJoinTournament());
        }

        if (enterBtn) {
            enterBtn.addEventListener('click', () => this.handleEnterBattle());
        }
    }

    /**
     * Render tournament details
     */
    renderTournamentDetails() {
        const t = this.tournament;

        // Header
        document.getElementById('tournamentTitle').textContent = t.name;
        document.getElementById('tournamentDescription').textContent = t.description;

        // Status and Details
        const statusEl = document.getElementById('tournamentStatus');
        statusEl.textContent = t.status.toUpperCase();
        statusEl.classList.add(`status-${t.status}`);

        const startDate = new Date(t.startDate).toLocaleDateString();
        document.getElementById('tournamentStartDate').textContent = startDate;
        document.getElementById('tournamentDuration').textContent = `${t.duration} hours`;
        document.getElementById('tournamentParticipants').textContent = `${t.participants}/${t.maxParticipants}`;
        document.getElementById('tournamentDifficulty').textContent = 
            (t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1));
        document.getElementById('tournamentFee').textContent = t.fee === 0 ? 'FREE' : `$${t.fee}`;

        // Check if joined
        this.isJoined = true; // Set based on API response
        this.updateJoinButton();

        // Render problems
        this.renderProblems();

        // Render leaderboard
        this.renderLeaderboard();
    }

    /**
     * Update join button based on status
     */
    updateJoinButton() {
        const joinBtn = document.getElementById('joinTournamentBtn');
        const enterBtn = document.getElementById('enterBattleBtn');

        if (this.isJoined) {
            joinBtn.style.display = 'none';
            enterBtn.style.display = 'flex';
        } else {
            joinBtn.style.display = 'flex';
            enterBtn.style.display = 'none';
        }
    }

    /**
     * Render problems list
     */
    renderProblems() {
        const container = document.getElementById('problemsList');
        
        container.innerHTML = (this.tournament.problems || [])
            .map(p => `
                <div style="padding: 1rem; border: 1px solid rgba(0,255,136,0.2); border-radius: 0.5rem; 
                            margin-bottom: 0.5rem; background: rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: #00ff88; margin: 0 0 0.25rem 0;">${p.title}</h4>
                            <span style="color: #888; font-size: 0.875rem;">
                                Difficulty: ${p.difficulty}
                            </span>
                        </div>
                        <span style="color: #3a86ff; font-weight: 600;">+${p.score} pts</span>
                    </div>
                </div>
            `)
            .join('');
    }

    /**
     * Render leaderboard preview
     */
    renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        
        tbody.innerHTML = (this.tournament.leaderboard || [])
            .map(entry => `
                <tr>
                    <td>${entry.rank}</td>
                    <td>${entry.username}</td>
                    <td>${entry.score}</td>
                    <td>${entry.time}</td>
                </tr>
            `)
            .join('');
    }

    /**
     * Handle join tournament
     */
    async handleJoinTournament() {
        try {
            const loadingEl = document.getElementById('loadingOverlay');
            loadingEl?.classList.add('active');

            // API call would go here
            // await api.joinTournament(this.tournamentId);
            
            this.isJoined = true;
            this.updateJoinButton();
        } catch (error) {
            console.error('Error joining tournament:', error);
            alert('Failed to join tournament');
        } finally {
            loadingEl?.classList.remove('active');
        }
    }

    /**
     * Handle enter battle
     */
    handleEnterBattle() {
        // Get first problem ID from tournament
        const firstProblemId = this.tournament.problems[0]?.id || 1;
        window.location.href = `coding-room.html?tournament=${this.tournamentId}&problem=${firstProblemId}`;
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.querySelector('.tournament-content');
        if (container) {
            container.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: #ff4444;">
                    <h2>${message}</h2>
                    <a href="dashboard.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Dashboard</a>
                </div>
            `;
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new TournamentManager();
});