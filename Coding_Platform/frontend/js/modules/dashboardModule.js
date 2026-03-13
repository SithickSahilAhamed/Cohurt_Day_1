/**
 * Dashboard Module
 * 
 * Manages the user dashboard:
 * - Welcome banner
 * - Active tournaments
 * - User statistics
 * - Recent contests
 * - Quick actions
 */

class DashboardModule {
  constructor(apiService, socketService, authService) {
    this.apiService = apiService;
    this.socketService = socketService;
    this.authService = authService;

    this.tournaments = [];
    this.userStats = null;
    this.recentContests = [];
  }

  /**
   * Initialize dashboard
   */
  async initialize() {
    console.log('🚀 Initializing Dashboard...');

    try {
      // Load user stats
      const user = this.authService.getUser();
      if (user) {
        this.loadUserStats(user.id);
      }

      // Load tournaments
      await this.loadTournaments();

      // Load recent contests
      await this.loadRecentContests();

      // Setup WebSocket listeners for real-time updates
      this.socketService.on('tournament-started', () => this.onTournamentStarted());
      this.socketService.on('user-rank-update', (data) => this.updateUserRank(data));

      console.log('✅ Dashboard initialized');
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
    }
  }

  /**
   * Load user stats
   */
  async loadUserStats(userId) {
    try {
      const stats = await this.apiService.getUserStats(userId);
      this.userStats = stats;
      this.renderStats();
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  }

  /**
   * Load all tournaments
   */
  async loadTournaments() {
    try {
      const response = await this.apiService.getTournaments();
      this.tournaments = response.tournaments || [];
      this.renderTournaments();
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    }
  }

  /**
   * Load recent contests
   */
  async loadRecentContests() {
    try {
      const userId = this.authService.getUser().id;
      const response = await this.apiService.getUserContests(userId);
      this.recentContests = response.contests || [];
      this.renderRecentContests();
    } catch (error) {
      console.error('Failed to load recent contests:', error);
    }
  }

  /**
   * Render user statistics
   */
  renderStats() {
    if (!this.userStats) return;

    const statsContainer = document.getElementById('user-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Contests</div>
          <div class="stat-value">${this.userStats.totalContests || 0}</div>
          <div class="stat-change ${this.userStats.contestsTrend > 0 ? 'positive' : 'negative'}">
            ${this.userStats.contestsTrend > 0 ? '↑' : '↓'} ${this.userStats.contestsTrend}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Win Rate</div>
          <div class="stat-value">${this.userStats.winRate || 0}%</div>
          <div class="stat-bar">
            <div class="stat-bar-fill" style="width: ${this.userStats.winRate || 0}%"></div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Current Rank</div>
          <div class="stat-value">#${this.userStats.currentRank || 'N/A'}</div>
          <div class="stat-region">Global</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Problems Solved</div>
          <div class="stat-value">${this.userStats.problemsSolved || 0}</div>
          <div class="stat-change positive">↑ ${this.userStats.recentSolves || 0} this week</div>
        </div>
      </div>
    `;
  }

  /**
   * Render available tournaments
   */
  renderTournaments() {
    const tournamentsContainer = document.getElementById('tournaments-container');
    if (!tournamentsContainer || !this.tournaments.length) return;

    tournamentsContainer.innerHTML = this.tournaments.map(tournament => `
      <div class="tournament-card">
        <div class="tournament-header">
          <h3>${tournament.name}</h3>
          <span class="tournament-badge ${tournament.status}">
            ${tournament.status === 'live' ? '🔴 Live' : tournament.status === 'upcoming' ? '⏰ Upcoming' : '✓ Ended'}
          </span>
        </div>
        <p class="tournament-desc">${tournament.description}</p>
        <div class="tournament-info">
          <div class="info-item">
            <span class="label">Participants:</span>
            <span class="value">${tournament.participants}</span>
          </div>
          <div class="info-item">
            <span class="label">Problems:</span>
            <span class="value">${tournament.problemCount}</span>
          </div>
          <div class="info-item">
            <span class="label">Duration:</span>
            <span class="value">${tournament.duration}</span>
          </div>
        </div>
        <div class="tournament-actions">
          ${tournament.status === 'live' ? `
            <a href="coding-room.html?tournament=${tournament.id}" class="btn btn-primary btn-sm">Enter Contest</a>
          ` : tournament.status === 'upcoming' ? `
            <button class="btn btn-secondary btn-sm" onclick="joinTournament(${tournament.id})">Join</button>
            <a href="tournament.html?id=${tournament.id}" class="btn btn-outline btn-sm">Details</a>
          ` : `
            <a href="tournament.html?id=${tournament.id}" class="btn btn-outline btn-sm">View Results</a>
          `}
        </div>
      </div>
    `).join('');
  }

  /**
   * Render recent contests
   */
  renderRecentContests() {
    const recentContainer = document.getElementById('recent-contests');
    if (!recentContainer || !this.recentContests.length) return;

    recentContainer.innerHTML = `
      <table class="contests-table">
        <thead>
          <tr>
            <th>Tournament</th>
            <th>Date</th>
            <th>Rank</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${this.recentContests.map(contest => `
            <tr>
              <td><a href="tournament.html?id=${contest.tournamentId}">${contest.tournamentName}</a></td>
              <td>${new Date(contest.date).toLocaleDateString()}</td>
              <td>#${contest.rank}</td>
              <td>${contest.score}</td>
              <td><span class="status-badge ${contest.result}">${contest.result === 'win' ? '✓ Won' : '✗ Lost'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Handle tournament started event
   */
  onTournamentStarted() {
    this.loadTournaments();
  }

  /**
   * Update user rank from WebSocket
   */
  updateUserRank(data) {
    if (this.userStats) {
      this.userStats.currentRank = data.newRank;
      this.renderStats();
    }
  }

  /**
   * Join tournament
   */
  async joinTournament(tournamentId) {
    try {
      const response = await this.apiService.joinTournament(tournamentId);
      if (response.success) {
        alert('✓ Successfully joined tournament!');
        this.loadTournaments();
      }
    } catch (error) {
      alert('Failed to join: ' + error.message);
    }
  }
}
