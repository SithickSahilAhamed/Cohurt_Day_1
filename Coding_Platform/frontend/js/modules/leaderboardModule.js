/**
 * Leaderboard Module
 * 
 * Manages global and tournament leaderboards:
 * - Real-time rank updates via WebSocket
 * - Animated rank changes
 * - User profile integration
 * - Tournament-specific leaderboards
 */

class LeaderboardModule {
  constructor(apiService, socketService, authService) {
    this.apiService = apiService;
    this.socketService = socketService;
    this.authService = authService;

    this.leaderboard = [];
    this.currentTournament = null;
    this.userPosition = null;
    this.filterMode = 'global'; // 'global' or 'tournament'

    this.initializeWebSocketListeners();
  }

  /**
   * Initialize leaderboard page
   */
  async initialize() {
    console.log('🚀 Initializing Leaderboard...');

    try {
      // Get tournament ID from URL if provided
      const params = new URLSearchParams(window.location.search);
      const tournamentId = params.get('tournament');

      if (tournamentId) {
        this.currentTournament = tournamentId;
        this.filterMode = 'tournament';
        await this.loadTournamentLeaderboard(tournamentId);
      } else {
        await this.loadGlobalLeaderboard();
      }

      console.log('✅ Leaderboard initialized');
    } catch (error) {
      console.error('❌ Leaderboard initialization failed:', error);
    }
  }

  /**
   * Load global leaderboard
   */
  async loadGlobalLeaderboard() {
    try {
      const response = await this.apiService.getGlobalLeaderboard();
      this.leaderboard = response.leaderboard || [];
      this.userPosition = response.userPosition;
      this.renderLeaderboard();
    } catch (error) {
      console.error('Failed to load global leaderboard:', error);
    }
  }

  /**
   * Load tournament-specific leaderboard
   */
  async loadTournamentLeaderboard(tournamentId) {
    try {
      const response = await this.apiService.getTournamentLeaderboard(tournamentId);
      this.leaderboard = response.leaderboard || [];
      this.userPosition = response.userPosition;
      this.renderLeaderboard();
    } catch (error) {
      console.error('Failed to load tournament leaderboard:', error);
    }
  }

  /**
   * Render leaderboard
   */
  renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    let html = `
      <div class="leaderboard-header">
        <h2>${this.filterMode === 'global' ? 'Global Leaderboard' : 'Tournament Leaderboard'}</h2>
        <div class="leaderboard-filters">
          <button class="filter-btn ${this.filterMode === 'global' ? 'active' : ''}" 
                  onclick="leaderboardModule.switchToGlobal()">
            Global
          </button>
        </div>
      </div>

      ${this.userPosition ? `
        <div class="my-position-card">
          <h3>Your Position</h3>
          <div class="position-info">
            <span class="rank-badge">
              ${this.userPosition.rank <= 3 ? 
                ['🥇', '🥈', '🥉'][this.userPosition.rank - 1] : 
                '#' + this.userPosition.rank}
            </span>
            <span class="username">${this.userPosition.username}</span>
            <span class="score">${this.userPosition.score} pts</span>
          </div>
        </div>
      ` : ''}

      <table class="leaderboard-table">
        <thead>
          <tr>
            <th style="width: 80px;">Rank</th>
            <th>Player</th>
            <th style="width: 100px;">Rating</th>
            <th style="width: 120px;">Score</th>
            <th style="width: 100px;">Contests</th>
            <th style="width: 80px;">Win Rate</th>
          </tr>
        </thead>
        <tbody id="leaderboard-body">
          ${this.leaderboard.map((entry, idx) => this.renderLeaderboardEntry(entry, idx)).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  /**
   * Render single leaderboard entry
   */
  renderLeaderboardEntry(entry, index) {
    const rank = index + 1;
    const rankMedal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    const isCurrentUser = this.authService.getUser()?.id === entry.userId;

    return `
      <tr class="leaderboard-entry ${isCurrentUser ? 'highlighted' : ''}" data-user-id="${entry.userId}">
        <td class="rank-cell">
          <span class="rank-medal">${rankMedal || rank}</span>
        </td>
        <td class="player-cell">
          <div class="player-avatar" style="background: linear-gradient(135deg, ${entry.avatarColor1}, ${entry.avatarColor2})">
            ${entry.avatar ? `<img src="${entry.avatar}" alt="${entry.username}">` : entry.username.charAt(0).toUpperCase()}
          </div>
          <div class="player-info">
            <div class="player-name">
              ${entry.username}
              ${entry.badge ? `<span class="player-badge">${entry.badge}</span>` : ''}
            </div>
            <div class="player-title">${entry.title || 'Member'}</div>
          </div>
        </td>
        <td class="rating-cell">
          <div class="rating-display">
            ${entry.rating || 0}
            <span class="rating-trend ${entry.ratingTrend > 0 ? 'up' : entry.ratingTrend < 0 ? 'down' : 'neutral'}">
              ${entry.ratingTrend > 0 ? '↑' : entry.ratingTrend < 0 ? '↓' : '→'} ${Math.abs(entry.ratingTrend)}
            </span>
          </div>
        </td>
        <td class="score-cell">
          <span class="score-value">${entry.score.toLocaleString()}</span>
        </td>
        <td class="contests-cell">
          <span>${entry.totalContests}</span>
        </td>
        <td class="win-rate-cell">
          <div class="win-rate-bar">
            <div class="win-rate-fill" style="width: ${entry.winRate}%"></div>
          </div>
          <span class="win-rate-text">${entry.winRate}%</span>
        </td>
      </tr>
    `;
  }

  /**
   * Switch to global leaderboard
   */
  async switchToGlobal() {
    this.filterMode = 'global';
    this.currentTournament = null;
    await this.loadGlobalLeaderboard();
  }

  /**
   * Initialize WebSocket listeners
   */
  initializeWebSocketListeners() {
    try {
      // Listen for rank updates
      this.socketService.on('rank-update', (data) => {
        this.onRankUpdate(data);
      });

      // Listen for leaderboard changes
      this.socketService.on('leaderboard-update', (data) => {
        this.onLeaderboardUpdate(data);
      });

      // Listen for new scores
      this.socketService.on('score-update', (data) => {
        this.onScoreUpdate(data);
      });

      console.log('✅ WebSocket listeners initialized');
    } catch (error) {
      console.error('Failed to initialize WebSocket listeners:', error);
    }
  }

  /**
   * Handle rank update
   */
  onRankUpdate(data) {
    const entryElement = document.querySelector(`tr[data-user-id="${data.userId}"]`);
    if (!entryElement) return;

    const oldRank = parseInt(entryElement.querySelector('.rank-medal').textContent) || entryElement.rowIndex;
    const newRank = data.newRank;

    // Animate rank change
    if (oldRank > newRank) {
      entryElement.classList.add('rank-up-animation');
    } else if (oldRank < newRank) {
      entryElement.classList.add('rank-down-animation');
    }

    // Update the entry
    const newEntry = { ...this.leaderboard[newRank - 1], ...data };
    this.leaderboard[newRank - 1] = newEntry;
    entryElement.innerHTML = this.renderLeaderboardEntry(newEntry, newRank - 1).match(/<td[\s\S]*?<\/tr>/)[0];

    setTimeout(() => entryElement.classList.remove('rank-up-animation', 'rank-down-animation'), 600);
  }

  /**
   * Handle complete leaderboard update
   */
  onLeaderboardUpdate(data) {
    this.leaderboard = data.leaderboard || [];
    this.renderLeaderboard();
  }

  /**
   * Handle score update
   */
  onScoreUpdate(data) {
    const entry = this.leaderboard.find(e => e.userId === data.userId);
    if (entry) {
      entry.score = data.newScore;
      entry.ratingTrend = data.ratingChange;
      this.renderLeaderboard();
    }
  }

  /**
   * View user profile
   */
  async viewUserProfile(userId) {
    try {
      const profile = await this.apiService.getUserProfile(userId);
      this.displayUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  /**
   * Display user profile modal
   */
  displayUserProfile(profile) {
    const profileHTML = `
      <div class="user-profile-modal">
        <div class="profile-header">
          <div class="profile-avatar-large" style="background: linear-gradient(135deg, ${profile.avatarColor1}, ${profile.avatarColor2})">
            ${profile.avatar ? `<img src="${profile.avatar}">` : profile.username.charAt(0).toUpperCase()}
          </div>
          <div class="profile-info">
            <h2>${profile.username}</h2>
            <p class="profile-title">${profile.title || 'Member'}</p>
            <div class="profile-stats">
              <div>Rank: <span>#${profile.rank}</span></div>
              <div>Rating: <span>${profile.rating}</span></div>
              <div>Contests: <span>${profile.totalContests}</span></div>
            </div>
          </div>
        </div>

        <div class="profile-tabs">
          <div class="profile-tab-content">
            <h3>Recent Contests</h3>
            <ul class="recent-contests-list">
              ${profile.recentContests.map(c => `
                <li>
                  <a href="tournament.html?id=${c.tournamentId}">${c.tournamentName}</a> - Rank #${c.rank}
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = profileHTML;
    document.body.appendChild(modal);

    setTimeout(() => modal.classList.add('active'), 10);
  }
}
