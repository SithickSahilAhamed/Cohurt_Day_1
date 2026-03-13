/**
 * API.js - Centralized API communication layer
 * Handles all fetch requests to the backend with automatic JWT token management
 */

// Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Update for your backend URL

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.timeout = 10000; // 10 seconds
    }

    /**
     * Get authorization headers with JWT token
     */
    getHeaders(includeContentType = true) {
        const headers = {
            ...includeContentType && { 'Content-Type': 'application/json' }
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Handle API response and errors
     */
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'API Error',
                error: data
            };
        }

        return data;
    }

    /**
     * Generic fetch wrapper with timeout and error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: this.getHeaders(options.method !== 'GET'),
            ...options
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return await this.handleResponse(response);
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // ==================== AUTHENTICATION ====================
    async login(email, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(username, email, password) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    // ==================== TOURNAMENTS ====================
    async getTournaments(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/tournaments${params ? '?' + params : ''}`);
    }

    async getTournamentById(tournamentId) {
        return this.request(`/tournaments/${tournamentId}`);
    }

    async joinTournament(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/join`, {
            method: 'POST'
        });
    }

    async getTournamentBracket(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/bracket`);
    }

    // ==================== PROBLEMS ====================
    async getProblem(problemId) {
        return this.request(`/problems/${problemId}`);
    }

    async getTournamentProblems(tournamentId) {
        return this.request(`/tournaments/${tournamentId}/problems`);
    }

    // ==================== CODE SUBMISSION ====================
    async submitCode(problemId, code, language) {
        return this.request('/submit', {
            method: 'POST',
            body: JSON.stringify({
                problemId,
                code,
                language,
                timestamp: Date.now()
            })
        });
    }

    async runCode(problemId, code, language) {
        return this.request('/run', {
            method: 'POST',
            body: JSON.stringify({
                problemId,
                code,
                language
            })
        });
    }

    async getSubmissionResult(submissionId) {
        return this.request(`/submissions/${submissionId}`);
    }

    // ==================== LEADERBOARD ====================
    async getGlobalLeaderboard(page = 1, limit = 50) {
        return this.request(`/leaderboard?page=${page}&limit=${limit}`);
    }

    async getTournamentLeaderboard(tournamentId, page = 1, limit = 50) {
        return this.request(`/tournaments/${tournamentId}/leaderboard?page=${page}&limit=${limit}`);
    }

    async getPlayerRank(userId) {
        return this.request(`/users/${userId}/rank`);
    }

    async searchLeaderboard(query) {
        return this.request(`/leaderboard/search?q=${encodeURIComponent(query)}`);
    }

    // ==================== USER PROFILE ====================
    async getCurrentUser() {
        return this.request('/user/profile');
    }

    async getUserProfile(userId) {
        return this.request(`/users/${userId}`);
    }

    async updateUserProfile(data) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async getUserStats(userId) {
        return this.request(`/users/${userId}/stats`);
    }

    // ==================== BADGES & ACHIEVEMENTS ====================
    async getUserBadges(userId) {
        return this.request(`/users/${userId}/badges`);
    }

    async getAchievements() {
        return this.request('/achievements');
    }

    // ==================== UTILITY ====================
    /**
     * Check if API is reachable (for connection status)
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Create global API client instance
const api = new APIClient();