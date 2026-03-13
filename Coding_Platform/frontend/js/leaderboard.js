/**
 * Leaderboard.js - Leaderboard Page Logic
 * Handles leaderboard data fetching, filtering, and rendering
 */

class LeaderboardPageManager {
    constructor() {
        this.allRankings = [];
        this.filteredRankings = [];
        this.currentPage = 1;
        this.pageSize = 50;
        this.currentSort = 'rating';
        this.timeFilter = 'all-time';
        this.init();
    }

    /**
     * Initialize leaderboard page
     */
    async init() {
        requireAuth();
        updateUserUI();
        this.setupEventListeners();
        await this.loadLeaderboard();
        this.initWebSocket();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Time filter
        const timeFilter = document.getElementById('timeFilterSelect');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => this.handleTimeFilter(e.target.value));
        }

        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sort = e.target.dataset.sort;
                this.handleSort(sort);
            });
        });

        // Pagination
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousPage());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextPage());
    }

    /**
     * Load leaderboard data
     */
    async loadLeaderboard() {
        const loadingEl = document.getElementById('leaderboardLoading');
        const tableEl = document.getElementById('rankingsTable');

        try {
            loadingEl.style.display = 'flex';

            // Mock data (replace with API call)
            this.allRankings = this.getMockLeaderboard();
            this.filteredRankings = this.allRankings;

            this.renderLeaderboard();
            this.renderTopPlayers();
            this.renderYourRank();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    /**
     * Get mock leaderboard data
     */
    getMockLeaderboard() {
        const players = [
            { rank: 1, username: 'CodeMaster', userId: 1, rating: 2850, wins: 145, problems: 534, winRate: 72.5 },
            { rank: 2, username: 'AlgoKing', userId: 2, rating: 2760, wins: 138, problems: 521, winRate: 70.1 },
            { rank: 3, username: 'ByteRunner', userId: 3, rating: 2645, wins: 132, problems: 498, winRate: 68.2 },
            { rank: 4, username: 'DebugMaster', userId: 4, rating: 2580, wins: 125, problems: 480, winRate: 65.3 },
            { rank: 5, username: 'StackOverflow', userId: 5, rating: 2520, wins: 120, problems: 465, winRate: 62.8 },
            { rank: 6, username: 'PythonPro', userId: 6, rating: 2480, wins: 116, problems: 452, winRate: 61.0 },
            { rank: 7, username: 'JavaJunkie', userId: 7, rating: 2450, wins: 112, problems: 440, winRate: 59.5 },
            { rank: 8, username: 'CppCoder', userId: 8, rating: 2400, wins: 108, problems: 428, winRate: 57.8 },
        ];

        // Extend with more players
        for (let i = 8; i < 200; i++) {
            players.push({
                rank: i + 1,
                username: `Player${i}`,
                userId: i,
                rating: Math.max(1000, 2400 - (i * 10)),
                wins: Math.max(30, 108 - i),
                problems: Math.max(100, 428 - (i * 2)),
                winRate: Math.max(20, 57.8 - (i * 0.2))
            });
        }

        return players;
    }

    /**
     * Render top 3 players
     */
    renderTopPlayers() {
        const sorted = [...this.allRankings].sort((a, b) => b.rating - a.rating);
        
        for (let i = 0; i < 3; i++) {
            const player = sorted[i];
            if (!player) continue;

            const placeNum = i + 1;
            document.getElementById(`topPlayer${placeNum}Name`).textContent = player.username;
            document.getElementById(`topPlayer${placeNum}Score`).textContent = `${player.rating} points`;
        }
    }

    /**
     * Render your rank
     */
    renderYourRank() {
        const user = getCurrentUser();
        if (!user) return;

        // Find user in rankings (mock - would come from API)
        const userRank = this.allRankings.find(p => p.userId === parseInt(user.id)) || {
            rank: 'N/A',
            rating: 0,
            wins: 0,
            problems: 0,
            winRate: 0
        };

        const yourRankContent = document.getElementById('yourRankContent');
        yourRankContent.innerHTML = `
            <div class="rank-stat">
                <div class="rank-stat-value">#${userRank.rank}</div>
                <div class="rank-stat-label">Your Rank</div>
            </div>
            <div class="rank-stat">
                <div class="rank-stat-value">${userRank.rating}</div>
                <div class="rank-stat-label">Rating</div>
            </div>
            <div class="rank-stat">
                <div class="rank-stat-value">${userRank.wins}</div>
                <div class="rank-stat-label">Wins</div>
            </div>
            <div class="rank-stat">
                <div class="rank-stat-value">${userRank.problems}</div>
                <div class="rank-stat-label">Problems</div>
            </div>
        `;
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        if (!query) {
            this.filteredRankings = this.allRankings;
        } else {
            this.filteredRankings = this.allRankings.filter(p => 
                p.username.toLowerCase().includes(query.toLowerCase())
            );
        }

        this.currentPage = 1;
        this.renderLeaderboard();
    }

    /**
     * Handle time filter
     */
    handleTimeFilter(filter) {
        this.timeFilter = filter;
        // Would reload leaderboard with different data
        this.currentPage = 1;
    }

    /**
     * Handle sort
     */
    handleSort(sortBy) {
        this.currentSort = sortBy;

        // Update button states
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === sortBy);
        });

        // Sort data
        const sortFunctions = {
            rating: (a, b) => b.rating - a.rating,
            wins: (a, b) => b.wins - a.wins,
            problems: (a, b) => b.problems - a.problems
        };

        this.filteredRankings.sort(sortFunctions[sortBy] || sortFunctions.rating);
        this.currentPage = 1;
        this.renderLeaderboard();
    }

    /**
     * Render leaderboard table
     */
    renderLeaderboard() {
        const tbody = document.getElementById('rankingsBody');
        const table = document.getElementById('rankingsTable');
        const emptyEl = document.getElementById('leaderboardEmpty');

        if (this.filteredRankings.length === 0) {
            table.style.display = 'none';
            emptyEl.style.display = 'flex';
            return;
        }

        table.style.display = 'table';
        emptyEl.style.display = 'none';

        // Get page data
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredRankings.slice(start, end);

        tbody.innerHTML = pageData.map(p => `
            <tr>
                <td class="rank-col">
                    <span style="font-weight: 700; color: var(--accent-primary);">
                        ${p.rank}
                    </span>
                </td>
                <td class="player-col">
                    <div class="player-info">
                        <span class="player-name">${p.username}</span>
                        <span class="player-handle">@${p.username.toLowerCase()}</span>
                    </div>
                </td>
                <td class="rating-col">${p.rating}</td>
                <td class="wins-col">${p.wins}</td>
                <td class="problems-col">${p.problems}</td>
                <td class="winrate-col">${p.winRate.toFixed(1)}%</td>
            </tr>
        `).join('');

        this.updatePagination();
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const totalPages = Math.ceil(this.filteredRankings.length / this.pageSize);
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('paginationInfo');

        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;

        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
    }

    /**
     * Navigate to previous page
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderLeaderboard();
            window.scrollTo(0, 0);
        }
    }

    /**
     * Navigate to next page
     */
    nextPage() {
        const totalPages = Math.ceil(this.filteredRankings.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderLeaderboard();
            window.scrollTo(0, 0);
        }
    }

    /**
     * Initialize WebSocket for real-time updates
     */
    initWebSocket() {
        if (typeof ws !== 'undefined' && ws) {
            ws.on('leaderboard:update', (data) => {
                this.handleLeaderboardUpdate(data);
            });
        }
    }

    /**
     * Handle real-time leaderboard update
     */
    handleLeaderboardUpdate(data) {
        // Update ranking in data
        const index = this.allRankings.findIndex(p => p.userId === data.userId);
        if (index >= 0) {
            this.allRankings[index] = { ...this.allRankings[index], ...data };
        }

        // Re-sort and render
        this.handleSort(this.currentSort);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new LeaderboardPageManager();
});