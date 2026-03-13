/**
 * API Service - HTTP Communication Layer
 * 
 * Handles all REST API communication with the backend.
 * Provides high-level methods for authentication, tournaments, problems, and submissions.
 * All frontend components use this service instead of fetch() directly.
 * 
 * Backend developers: Implement these endpoints to connect with this service
 */

class APIService {
  constructor(config) {
    this.baseURL = config.API.BASE_URL;
    this.timeout = config.API.TIMEOUT;
    this.retryConfig = config.API.RETRY;
    this.endpoints = config.API.ENDPOINTS;

    // Bind methods to preserve 'this' context
    this.fetch = this.fetch.bind(this);
  }

  /**
   * Build full URL from endpoint key
   * Example: buildUrl('AUTH.LOGIN') => 'http://localhost:5000/api/auth/login'
   */
  buildUrl(endpointKey) {
    const path = endpointKey.split('.').reduce((obj, key) => obj?.[key], this.endpoints);
    if (!path) {
      throw new Error(`Endpoint not found: ${endpointKey}`);
    }
    return `${this.baseURL}${path}`;
  }

  /**
   * Send HTTP request with automatic retry and error handling
   */
  async fetch(url, options = {}, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      // Handle response and errors
      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        throw error;
      }

      const data = await response.json();
      console.log(`✅ API Response [${response.status}]:`, data);
      return { success: true, data, status: response.status };

    } catch (error) {
      clearTimeout(timeoutId);

      // Retry logic for network errors
      if (this.retryConfig.enabled && retryCount < this.retryConfig.maxAttempts && this.isRetriable(error)) {
        const delay = this.retryConfig.delayMs * Math.pow(this.retryConfig.backoffMultiplier, retryCount);
        console.warn(`⚠️  Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${this.retryConfig.maxAttempts})`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetch(url, options, retryCount + 1);
      }

      console.error('❌ API Error:', error);
      throw error;
    }
  }

  /**
   * Check if error is retriable (network error, timeout, 5xx)
   */
  isRetriable(error) {
    if (error.name === 'AbortError') return true; // Timeout
    if (error instanceof TypeError) return true; // Network error
    if (error.status >= 500) return true; // Server error
    return false;
  }

  /**
   * Handle API error responses
   */
  async handleErrorResponse(response) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const error = new Error(errorData.message || 'API Error');
    error.status = response.status;
    error.data = errorData;

    return error;
  }

  /**
   * Get authorization headers with JWT token
   */
  getAuthHeaders() {
    const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  /**
   * TODO: Backend - Implement POST /api/auth/login
   * Request: { email, password }
   * Response: { token, user: { id, name, email, ... } }
   */
  async login(email, password) {
    const response = await this.fetch(this.buildUrl('AUTH.LOGIN'), {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement POST /api/auth/register
   * Request: { name, email, password, confirmPassword }
   * Response: { token, user: { id, name, email, ... } }
   */
  async register(name, email, password, confirmPassword) {
    const response = await this.fetch(this.buildUrl('AUTH.REGISTER'), {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement POST /api/auth/logout
   */
  async logout() {
    const response = await this.fetch(this.buildUrl('AUTH.LOGOUT'), {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement POST /api/auth/refresh
   * Request: { refreshToken }
   * Response: { token, refreshToken }
   */
  async refreshToken(refreshToken) {
    const response = await this.fetch(this.buildUrl('AUTH.REFRESH_TOKEN'), {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/auth/profile
   * Response: { user: { id, name, email, ... } }
   */
  async getProfile() {
    const response = await this.fetch(this.buildUrl('AUTH.PROFILE'), {
      method: 'GET'
    });
    return response.data;
  }

  // ==========================================
  // TOURNAMENT ENDPOINTS
  // ==========================================

  /**
   * TODO: Backend - Implement GET /api/tournaments?page=1&limit=20&status=active
   * Response: { tournaments: [ { id, name, startTime, endTime, ... } ], total, page, limit }
   */
  async getTournaments(page = 1, limit = 20, filters = {}) {
    const query = new URLSearchParams({ page, limit, ...filters });
    const response = await this.fetch(`${this.buildUrl('TOURNAMENTS.LIST')}?${query}`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/tournaments/{id}
   * Response: { tournament: { id, name, description, startTime, endTime, problems: [], ... } }
   */
  async getTournamentDetail(tournamentId) {
    const response = await this.fetch(`${this.baseURL}/tournaments/${tournamentId}`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement POST /api/tournaments/{id}/join
   * Request: { }
   * Response: { message: 'Successfully joined', tournament: { ... } }
   */
  async joinTournament(tournamentId) {
    const response = await this.fetch(`${this.baseURL}/tournaments/${tournamentId}/join`, {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement POST /api/tournaments/{id}/leave
   */
  async leaveTournament(tournamentId) {
    const response = await this.fetch(`${this.baseURL}/tournaments/${tournamentId}/leave`, {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/tournaments/{id}/participants
   * Response: { participants: [ { userId, name, score, rank, ... } ] }
   */
  async getTournamentParticipants(tournamentId) {
    const response = await this.fetch(`${this.baseURL}/tournaments/${tournamentId}/participants`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/tournaments/{id}/problems
   * Response: { problems: [ { id, title, difficulty, ... } ] }
   */
  async getTournamentProblems(tournamentId) {
    const response = await this.fetch(`${this.baseURL}/tournaments/${tournamentId}/problems`, {
      method: 'GET'
    });
    return response.data;
  }

  // ==========================================
  // PROBLEM ENDPOINTS
  // ==========================================

  /**
   * TODO: Backend - Implement GET /api/problems/{id}
   * Response: { problem: { id, title, description, difficulty, constraints, ... } }
   */
  async getProblem(problemId) {
    const response = await this.fetch(`${this.baseURL}/problems/${problemId}`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/problems/{id}/examples
   * Response: { examples: [ { input, output, explanation } ] }
   */
  async getProblemExamples(problemId) {
    const response = await this.fetch(`${this.baseURL}/problems/${problemId}/examples`, {
      method: 'GET'
    });
    return response.data;
  }

  // ==========================================
  // JUDGE/CODE SUBMISSION ENDPOINTS
  // ==========================================

  /**
   * TODO: Backend - Implement RUN (test) endpoint
   * POST /api/judge/run
   * Request: { code, language, testcases: { input, expected output } }
   * Response: { results: [ { passed, output, expected, error } ] }
   */
  async runCode(code, language, problemId) {
    const response = await this.fetch(this.buildUrl('JUDGE.RUN_CODE'), {
      method: 'POST',
      body: JSON.stringify({ code, language, problemId })
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement SUBMIT endpoint
   * POST /api/judge/submit
   * Request: { code, language, problemId, tournamentId }
   * Response: { submissionId, status: 'pending'|'accepted'|'rejected', result: {...} }
   */
  async submitCode(code, language, problemId, tournamentId) {
    const response = await this.fetch(this.buildUrl('JUDGE.SUBMIT_CODE'), {
      method: 'POST',
      body: JSON.stringify({ code, language, problemId, tournamentId })
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/judge/result/{id}
   * Poll this endpoint to get submission verdict
   * Response: { status: 'pending'|'accepted'|'rejected', result: {...} }
   */
  async getJudgeResult(submissionId) {
    const response = await this.fetch(`${this.baseURL}/judge/result/${submissionId}`, {
      method: 'GET'
    });
    return response.data;
  }

  // ==========================================
  // LEADERBOARD ENDPOINTS
  // ==========================================

  /**
   * TODO: Backend - Implement GET /api/leaderboard/global?page=1&limit=20
   * Response: { leaderboard: [ { rank, userId, name, totalScore, problemsSolved, ... } ] }
   */
  async getGlobalLeaderboard(page = 1, limit = 20) {
    const query = new URLSearchParams({ page, limit });
    const response = await this.fetch(`${this.buildUrl('LEADERBOARD.GET_GLOBAL')}?${query}`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/leaderboard/tournament/{id}
   * Response: { leaderboard: [ { rank, userId, name, score, ... } ] }
   */
  async getTournamentLeaderboard(tournamentId, page = 1, limit = 20) {
    const query = new URLSearchParams({ page, limit });
    const response = await this.fetch(`${this.baseURL}/leaderboard/tournament/${tournamentId}?${query}`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/leaderboard/user-rank
   * Response: { rank, userId, score, ... }
   */
  async getUserRank(tournamentId) {
    const query = new URLSearchParams({ tournamentId });
    const response = await this.fetch(`${this.buildUrl('LEADERBOARD.GET_USER_RANK')}?${query}`, {
      method: 'GET'
    });
    return response.data;
  }

  // ==========================================
  // USER ENDPOINTS
  // ==========================================

  /**
   * TODO: Backend - Implement GET /api/users/{id}
   * Response: { user: { id, name, email, bio, statistics: {...} } }
   */
  async getUserProfile(userId) {
    const response = await this.fetch(`${this.baseURL}/users/${userId}`, {
      method: 'GET'
    });
    return response.data;
  }

  /**
   * TODO: Backend - Implement GET /api/users/{id}/submissions?page=1&limit=20
   * Response: { submissions: [ { id, problemId, status, dateSubmitted, ... } ] }
   */
  async getUserSubmissions(userId, page = 1, limit = 20) {
    const query = new URLSearchParams({ page, limit });
    const response = await this.fetch(`${this.baseURL}/users/${userId}/submissions?${query}`, {
      method: 'GET'
    });
    return response.data;
  }

  // ==========================================
  // HEALTH CHECK & DEBUG
  // ==========================================

  /**
   * Check if API server is available
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Global instance
let apiService = null;

/**
 * Initialize API Service globally
 * Call this in app.js during startup
 */
function initializeAPIService(config) {
  apiService = new APIService(config);
  console.log('✅ API Service Initialized:', config.API.BASE_URL);
  return apiService;
}

/**
 * Get global API Service instance
 */
function getAPIService() {
  if (!apiService) {
    throw new Error('API Service not initialized. Call initializeAPIService(config) first.');
  }
  return apiService;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIService, initializeAPIService, getAPIService };
}
