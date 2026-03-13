/**
 * Auth Service - Authentication & Authorization Management
 * 
 * Handles user login, registration, token management, and auth state.
 * Uses localStorage for persistent JWT token storage.
 * Automatically manages token refresh and session timeout.
 * 
 * Backend developers: Implement login/register endpoints with JWT tokens
 */

class AuthService {
  constructor(config, apiService) {
    this.config = config;
    this.apiService = apiService;

    // Load state from localStorage
    this.user = this.loadUser();
    this.token = this.loadToken();
    this.refreshToken = this.loadRefreshToken();

    // Auth state
    this.isAuthenticated = !!this.token && !!this.user;
    this.sessionTimeout = null;
    this.refreshTimeout = null;

    console.log('✅ Auth Service initialized:', this.isAuthenticated ? `User: ${this.user?.name}` : 'Guest');
  }

  // ==========================================
  // TOKEN MANAGEMENT
  // ==========================================

  /**
   * Load JWT token from localStorage
   */
  loadToken() {
    return localStorage.getItem(this.config.AUTH.TOKEN_KEY);
  }

  /**
   * Load refresh token from localStorage
   */
  loadRefreshToken() {
    return localStorage.getItem(this.config.AUTH.REFRESH_TOKEN_KEY);
  }

  /**
   * Load user data from localStorage
   */
  loadUser() {
    const userJSON = localStorage.getItem(this.config.AUTH.USER_KEY);
    try {
      return userJSON ? JSON.parse(userJSON) : null;
    } catch (error) {
      console.error('❌ Failed to parse user data:', error);
      return null;
    }
  }

  /**
   * Save token to localStorage
   */
  saveToken(token) {
    this.token = token;
    localStorage.setItem(this.config.AUTH.TOKEN_KEY, token);
    console.log('💾 Token saved');
  }

  /**
   * Save refresh token to localStorage
   */
  saveRefreshToken(refreshToken) {
    this.refreshToken = refreshToken;
    if (refreshToken) {
      localStorage.setItem(this.config.AUTH.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Save user data to localStorage
   */
  saveUser(user) {
    this.user = user;
    localStorage.setItem(this.config.AUTH.USER_KEY, JSON.stringify(user));
    console.log('💾 User data saved');
  }

  /**
   * Save complete auth state
   */
  saveAuthState(token, refreshToken, user) {
    this.saveToken(token);
    this.saveRefreshToken(refreshToken);
    this.saveUser(user);
    this.isAuthenticated = true;
    this.dispatchAuthChanged();
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  /**
   * TODO: Backend - Implement POST /api/auth/login
   * Login user with email and password
   */
  async login(email, password) {
    try {
      console.log('🔐 Logging in user:', email);

      const response = await this.apiService.login(email, password);

      // TODO: Backend should return { token, refreshToken?, user }
      if (!response.token || !response.user) {
        throw new Error('Invalid login response: missing token or user');
      }

      // Save auth state
      this.saveAuthState(response.token, response.refreshToken, response.user);

      // Setup session management
      this.setupSessionManagement();

      console.log('✅ User logged in:', response.user.name);
      return response;

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * TODO: Backend - Implement POST /api/auth/register
   * Register new user
   */
  async register(name, email, password, confirmPassword) {
    try {
      console.log('📝 Registering user:', email);

      const response = await this.apiService.register(name, email, password, confirmPassword);

      // TODO: Backend should return { token, refreshToken?, user }
      if (!response.token || !response.user) {
        throw new Error('Invalid registration response: missing token or user');
      }

      // Save auth state
      this.saveAuthState(response.token, response.refreshToken, response.user);

      // Setup session management
      this.setupSessionManagement();

      console.log('✅ User registered:', response.user.name);
      return response;

    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * TODO: Backend - Implement POST /api/auth/logout
   * Logout user and clear auth state
   */
  async logout() {
    try {
      console.log('🚪 Logging out user...');

      // Call backend logout endpoint
      if (this.isAuthenticated) {
        await this.apiService.logout();
      }

      // Clear all auth state
      this.clearAuth();

      console.log('✅ User logged out');
      return { success: true };

    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Clear auth state anyway
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.user = null;
    this.token = null;
    this.refreshToken = null;
    this.isAuthenticated = false;

    localStorage.removeItem(this.config.AUTH.TOKEN_KEY);
    localStorage.removeItem(this.config.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.config.AUTH.USER_KEY);

    this.clearSessionManagement();
    this.dispatchAuthChanged();

    console.log('🧹 Auth cleared');
  }

  // ==========================================
  // TOKEN REFRESH
  // ==========================================

  /**
   * TODO: Backend - Implement POST /api/auth/refresh
   * Refresh JWT token before expiry
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      console.warn('⚠️  No refresh token available');
      this.clearAuth();
      return false;
    }

    try {
      console.log('🔄 Refreshing token...');

      const response = await this.apiService.refreshToken(this.refreshToken);

      // TODO: Backend should return { token, refreshToken?, user? }
      if (!response.token) {
        throw new Error('No token in refresh response');
      }

      this.saveToken(response.token);
      if (response.refreshToken) {
        this.saveRefreshToken(response.refreshToken);
      }

      console.log('✅ Token refreshed');
      return true;

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Setup automatic token refresh before expiry
   */
  setupTokenRefresh() {
    if (!this.config.AUTH.REFRESH.AUTO_REFRESH || !this.token) {
      return;
    }

    // Try to extract expiry time from token (JWT format: header.payload.signature)
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const refreshThreshold = this.config.AUTH.REFRESH.THRESHOLD * 1000;
      const timeUntilRefresh = expiryTime - now - refreshThreshold;

      if (timeUntilRefresh > 0) {
        this.refreshTimeout = setTimeout(
          () => this.refreshAccessToken(),
          timeUntilRefresh
        );
        console.log(`⏰ Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000)}s`);
      } else {
        // Token already near expiry, refresh immediately
        this.refreshAccessToken();
      }
    } catch (error) {
      console.error('⚠️  Could not parse token expiry:', error);
    }
  }

  // ==========================================
  // SESSION MANAGEMENT
  // ==========================================

  /**
   * Setup session timeout and token refresh
   */
  setupSessionManagement() {
    this.setupTokenRefresh();

    // TODO: Add session timeout warning if needed
    if (this.config.AUTH.SESSION.WARN_BEFORE_LOGOUT) {
      console.log('⚠️  Session management enabled');
    }
  }

  /**
   * Clear session management timers
   */
  clearSessionManagement() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // ==========================================
  // STATE QUERIES
  // ==========================================

  /**
   * Check if user is authenticated
   */
  checkIsAuthenticated() {
    return this.isAuthenticated && !!this.token && !!this.user;
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current JWT token
   */
  getToken() {
    return this.token;
  }

  /**
   * Get specific user field
   */
  getUserField(fieldName) {
    return this.user?.[fieldName];
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.user?.roles?.includes(role) || false;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission) {
    return this.user?.permissions?.includes(permission) || false;
  }

  // ==========================================
  // EVENT DISPATCHING
  // ==========================================

  /**
   * Dispatch custom event when auth state changes
   * Components can listen: document.addEventListener('authChanged', ...)
   */
  dispatchAuthChanged() {
    const event = new CustomEvent('authChanged', {
      detail: {
        isAuthenticated: this.isAuthenticated,
        user: this.user
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Listen to auth state changes
   * Usage: authService.onAuthChanged(callback)
   */
  onAuthChanged(callback) {
    const handler = (event) => callback(event.detail);
    document.addEventListener('authChanged', handler);

    // Return unsubscribe function
    return () => {
      document.removeEventListener('authChanged', handler);
    };
  }

  // ==========================================
  // DEBUG & UTILITIES
  // ==========================================

  /**
   * Get auth status for debugging
   */
  getStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user,
      hasToken: !!this.token,
      hasRefreshToken: !!this.refreshToken,
      tokenExpiry: this.getTokenExpiry()
    };
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry() {
    if (!this.token) return null;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return new Date(payload.exp * 1000).toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Log auth status
   */
  logStatus() {
    console.log('📊 Auth Status:', this.getStatus());
  }
}

// Global instance
let authService = null;

/**
 * Initialize Auth Service globally
 * Call this in app.js during startup
 */
function initializeAuthService(config, apiService) {
  authService = new AuthService(config, apiService);
  console.log('✅ Auth Service Initialized');
  return authService;
}

/**
 * Get global Auth Service instance
 */
function getAuthService() {
  if (!authService) {
    throw new Error('Auth Service not initialized. Call initializeAuthService(config, apiService) first.');
  }
  return authService;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthService, initializeAuthService, getAuthService };
}
