/**
 * Auth.js - Authentication State Management
 * Handles login, registration, logout, and authentication state
 */

class AuthManager {
    constructor() {
        this.user = this.loadUser();
        this.token = this.loadToken();
        this.isLoggedIn = !!this.token && !!this.user;
    }

    /**
     * Load user data from localStorage
     */
    loadUser() {
        const userJSON = localStorage.getItem('user');
        try {
            return userJSON ? JSON.parse(userJSON) : null;
        } catch {
            return null;
        }
    }

    /**
     * Load JWT token from localStorage
     */
    loadToken() {
        return localStorage.getItem('token');
    }

    /**
     * Save user and token to localStorage
     */
    saveAuth(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.token = token;
        this.user = user;
        this.isLoggedIn = true;
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        this.isLoggedIn = false;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.isLoggedIn && !!this.token && !!this.user;
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Get JWT token
     */
    getToken() {
        return this.token;
    }

    /**
     * Check if token is expired (basic check)
     */
    isTokenExpired() {
        if (!this.token) return true;
        
        try {
            // Decode JWT (without verification - frontend only)
            const payload = this.token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            const currentTime = Math.floor(Date.now() / 1000);
            
            return decoded.exp ? decoded.exp < currentTime : false;
        } catch {
            return true;
        }
    }

    /**
     * Update user profile in memory and localStorage
     */
    updateUser(userData) {
        this.user = { ...this.user, ...userData };
        localStorage.setItem('user', JSON.stringify(this.user));
    }

    /**
     * Logout user
     */
    logout() {
        this.clearAuth();
        // Redirect to login page
        window.location.href = 'index.html';
    }

    /**
     * Check if user is guest
     */
    isGuest() {
        return this.user?.id === 'guest';
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if user is authenticated (used in HTML inline)
 */
function isAuthenticated() {
    return authManager.isAuthenticated();
}

/**
 * Get current user (used in HTML inline)
 */
function getCurrentUser() {
    return authManager.getCurrentUser();
}

/**
 * Ensure user is authenticated, redirect to login if not
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Redirect to dashboard if authenticated
 */
function redirectIfAuth() {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
}

// ==================== NAVIGATION HELPERS ====================

/**
 * Setup profile menu toggle in navbar
 */
function setupProfileMenu() {
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileMenu = document.querySelector('.profile-menu');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileAvatar) {
        profileAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu?.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            profileMenu?.classList.remove('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.logout();
        });
    }
}

/**
 * Update UI with current user info
 */
function updateUserUI() {
    const user = getCurrentUser();
    if (!user) return;

    // Update username displays
    const usernameElements = document.querySelectorAll('#username, #profileUsername');
    usernameElements.forEach(el => {
        el.textContent = user.username || user.email || 'Player';
    });

    // Update email displays
    const emailElements = document.querySelectorAll('#profileEmail');
    emailElements.forEach(el => {
        el.textContent = user.email || '';
    });

    // Update avatar images
    const avatarElements = document.querySelectorAll('#profileAvatar, #profileImage');
    const avatarSrc = user.avatar || 'public/assets/icons/avatar-default.svg';
    avatarElements.forEach(el => {
        el.src = avatarSrc;
        el.alt = `${user.username}'s Avatar`;
    });
}

/**
 * Initialize authentication check on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Update UI with user info if authenticated
    if (isAuthenticated()) {
        updateUserUI();
        setupProfileMenu();
    }
});