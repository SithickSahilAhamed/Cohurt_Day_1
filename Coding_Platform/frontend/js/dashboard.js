/**
 * Dashboard.js - Dashboard Page Logic
 * Handles tournament fetching, rendering, and user interactions
 */

class DashboardManager {
    constructor() {
        this.tournaments = [];
        this.currentFilter = 'all';
        this.isLoading = false;
        this.init();
    }

    /**
     * Initialize dashboard
     */
    async init() {
        requireAuth();
        updateUserUI();
        this.setupEventListeners();
        await this.loadTournaments();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    /**
     * Set active filter
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTournaments();
    }

    /**
     * Load tournaments from API
     */
    async loadTournaments() {
        const loadingEl = document.getElementById('tournamentsLoading');
        const gridEl = document.getElementById('tournamentsGrid');
        const emptyEl = document.getElementById('tournamentsEmpty');

        try {
            this.isLoading = true;
            loadingEl?.classList.add('active');

            // Mock data for testing (replace with API call)
            this.tournaments = this.getMockTournaments();
            
            this.renderTournaments();
        } catch (error) {
            console.error('Error loading tournaments:', error);
            gridEl.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #ff4444;">
                    <p>Failed to load tournaments. Please try again.</p>
                </div>
            `;
        } finally {
            this.isLoading = false;
            loadingEl?.classList.remove('active');
        }
    }

    /**
     * Mock tournament data (replace with API data)
     */
    getMockTournaments() {
        return [
            {
                id: 1,
                name: 'Beginner\'s Challenge',
                status: 'upcoming',
                startDate: '2026-03-20T10:00:00Z',
                endDate: '2026-03-20T12:00:00Z',
                description: 'Perfect for getting started with coding competitions',
                participants: 142,
                maxParticipants: 1000,
                difficulty: 'easy',
                fee: 0
            },
            {
                id: 2,
                name: 'Intermediate Battle',
                status: 'ongoing',
                startDate: '2026-03-13T14:00:00Z',
                endDate: '2026-03-13T16:00:00Z',
                description: 'Challenge yourself with moderate difficulty problems',
                participants: 256,
                maxParticipants: 500,
                difficulty: 'medium',
                fee: 5
            },
            {
                id: 3,
                name: 'Advanced Showdown',
                status: 'upcoming',
                startDate: '2026-03-25T18:00:00Z',
                endDate: '2026-03-25T20:00:00Z',
                description: 'For experienced competitive programmers only',
                participants: 89,
                maxParticipants: 200,
                difficulty: 'hard',
                fee: 20
            },
            {
                id: 4,
                name: 'Weekend Sprint',
                status: 'completed',
                startDate: '2026-03-10T09:00:00Z',
                endDate: '2026-03-10T11:00:00Z',
                description: 'Last week\'s weekend tournament',
                participants: 321,
                maxParticipants: 500,
                difficulty: 'easy',
                fee: 0
            }
        ];
    }

    /**
     * Filter tournaments based on current filter
     */
    getFilteredTournaments() {
        if (this.currentFilter === 'all') {
            return this.tournaments;
        }
        return this.tournaments.filter(t => t.status === this.currentFilter);
    }

    /**
     * Render tournaments to DOM
     */
    renderTournaments() {
        const gridEl = document.getElementById('tournamentsGrid');
        const emptyEl = document.getElementById('tournamentsEmpty');
        const filtered = this.getFilteredTournaments();

        if (filtered.length === 0) {
            gridEl.style.display = 'none';
            emptyEl.style.display = 'flex';
            return;
        }

        gridEl.style.display = 'grid';
        emptyEl.style.display = 'none';

        gridEl.innerHTML = filtered.map(t => this.createTournamentCard(t)).join('');

        // Add event listeners to join buttons
        gridEl.querySelectorAll('.join-tournament-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.tournamentId;
                this.handleJoinTournament(id);
            });
        });
    }

    /**
     * Create tournament card HTML
     */
    createTournamentCard(tournament) {
        const startDate = new Date(tournament.startDate).toLocaleString();
        const statusColor = {
            upcoming: '#3a86ff',
            ongoing: '#00ff88',
            completed: '#888'
        }[tournament.status] || '#888';

        return `
            <div class="tournament-card">
                <div class="tournament-card-header">
                    <h3 class="tournament-card-title">${tournament.name}</h3>
                    <div class="tournament-card-meta">
                        <span style="color: ${statusColor}; font-weight: 600;">● ${tournament.status.toUpperCase()}</span>
                        <span>Starts: ${startDate}</span>
                    </div>
                    <p class="tournament-card-description">${tournament.description}</p>
                </div>
                <div class="tournament-card-footer">
                    <div>
                        <div style="font-size: 0.875rem; color: #888; margin-bottom: 0.25rem;">
                            ${tournament.participants}/${tournament.maxParticipants} Players
                        </div>
                        <span class="tournament-fee">${tournament.fee === 0 ? 'FREE' : '$' + tournament.fee}</span>
                    </div>
                    <button 
                        class="btn btn-primary btn-sm join-tournament-btn"
                        data-tournament-id="${tournament.id}"
                    >
                        Join
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Handle join tournament action
     */
    async handleJoinTournament(tournamentId) {
        try {
            // Redirect to tournament page
            window.location.href = `tournament.html?id=${tournamentId}`;
        } catch (error) {
            console.error('Error joining tournament:', error);
            alert('Failed to join tournament. Please try again.');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});