/**
 * App.js - Application Bootstrap
 * 
 * Initializes all services and sets up the application.
 * This is the entry point for the frontend - call this when the page loads.
 * 
 * Backend developers: Services are initialized and ready to use after this runs
 */

class AppBootstrap {
    constructor(config) {
        this.config = config;
        this.isInitialized = false;
        this.services = {};
    }

    /**
     * Initialize entire application
     * Call this in <script> tag: await App.initialize(CONFIG)
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Application...');
            console.log(`📦 App: ${this.config.APP.NAME} v${this.config.APP.VERSION}`);
            console.log(`🌍 Environment: ${this.config.ENVIRONMENT}`);

            // 1. Initialize error handler first (for error messages)
            this.initializeErrorHandler();

            // 2. Initialize API service
            this.initializeAPIService();

            // 3. Initialize auth service
            this.initializeAuthService();

            // 4. Initialize socket service
            this.initializeSocketService();

            // 5. Setup global error handling
            this.setupGlobalErrorHandling();

            // 6. Check API server health
            await this.checkServerHealth();

            // 7. Restore session if logged in
            await this.restoreSession();

            // 8. Setup event listeners
            this.setupEventListeners();

            // 9. Ready
            this.isInitialized = true;
            console.log('✅ Application Initialized Successfully');

            return this;

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.errorHandler?.showErrorModal('Initialization Error', error.message, error);
            throw error;
        }
    }

    /**
     * Initialize error handler
     */
    initializeErrorHandler() {
        console.log('📋 Initializing Error Handler...');
        window.errorHandler = new ErrorHandler(this.config);
        this.services.errorHandler = window.errorHandler;
    }

    /**
     * Initialize API service
     */
    initializeAPIService() {
        console.log('📡 Initializing API Service...');
        window.apiService = new APIService(this.config);
        this.services.apiService = window.apiService;
    }

    /**
     * Initialize auth service
     */
    initializeAuthService() {
        console.log('🔐 Initializing Auth Service...');
        window.authService = new AuthService(this.config, window.apiService);
        this.services.authService = window.authService;

        // Log auth status
        if (window.authService.isAuthenticated) {
            console.log(`👤 Logged in as: ${window.authService.user?.name}`);
        } else {
            console.log('👤 Not authenticated');
        }
    }

    /**
     * Initialize socket service
     */
    initializeSocketService() {
        console.log('🔌 Initializing Socket Service...');
        window.socketService = new SocketService(this.config, window.authService);
        this.services.socketService = window.socketService;

        // Setup event listeners
        window.socketService.on('connect', () => {
            console.log('✅ Connected to real-time server');
            this.errorHandler?.success('Connected to server');
        });

        window.socketService.on('disconnect', () => {
            console.log('⚠️  Disconnected from real-time server');
            this.errorHandler?.warning('Disconnected from server');
        });
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        console.log('🛡️  Setting up global error handling...');

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled Promise Rejection:', event.reason);
            this.errorHandler?.error('An unexpected error occurred');
        });

        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            console.error('❌ Uncaught Error:', event.error);
            this.errorHandler?.error('An unexpected error occurred');
        });
    }

    /**
     * Check if API server is available
     */
    async checkServerHealth() {
        console.log('🏥 Checking server health...');
        try {
            const isHealthy = await window.apiService.healthCheck();
            if (isHealthy) {
                console.log('✅ API server is healthy');
            } else {
                console.warn('⚠️  API server health check failed');
            }
        } catch (error) {
            console.warn('⚠️  Could not reach API server:', error.message);
        }
    }

    /**
     * Restore user session from localStorage
     */
    async restoreSession() {
        console.log('🔄 Restoring session...');

        if (window.authService.isAuthenticated) {
            try {
                // Verify token is still valid
                const profile = await window.apiService.getProfile();
                console.log('✅ Session restored');
                return true;
            } catch (error) {
                console.warn('⚠️  Session invalid, logging out:', error.message);
                window.authService.clearAuth();
                return false;
            }
        }

        return false;
    }

    /**
     * Setup general event listeners
     */
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');

        // Listen to auth changes
        window.authService.onAuthChanged((event) => {
            console.log('📢 Auth changed:', event.isAuthenticated ? 'logged in' : 'logged out');
            // TODO: Update UI based on auth state
        });

        // Listen to socket events
        window.socketService.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // TODO: Backend developers - Add your event listeners here
        // Example:
        // window.socketService.on('leaderboard:update', (data) => {
        //     console.log('Leaderboard updated:', data);
        //     // Update UI
        // });
    }

    /**
     * Get service by name
     */
    getService(serviceName) {
        return this.services[serviceName];
    }

    /**
     * Get all services
     */
    getServices() {
        return this.services;
    }

    /**
     * Check if initialized
     */
    checkInitialized() {
        if (!this.isInitialized) {
            throw new Error('Application not initialized. Call App.initialize(CONFIG) first.');
        }
    }

    /**
     * Get app status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            environment: this.config.ENVIRONMENT,
            appName: this.config.APP.NAME,
            appVersion: this.config.APP.VERSION,
            apiUrl: this.config.API.BASE_URL,
            socketUrl: this.config.SOCKET.URL,
            authenticated: window.authService?.isAuthenticated || false,
            user: window.authService?.user || null,
            socketConnected: window.socketService?.isConnected || false,
            services: Object.keys(this.services)
        };
    }

    /**
     * Log app status
     */
    logStatus() {
        console.log('📊 App Status:', this.getStatus());
    }

    /**
     * Shutdown application gracefully
     */
    async shutdown() {
        console.log('🛑 Shutting down application...');

        try {
            // Logout if authenticated
            if (window.authService?.isAuthenticated) {
                await window.authService.logout();
            }

            // Disconnect socket
            if (window.socketService?.isConnected) {
                window.socketService.disconnect();
            }

            console.log('✅ Application shutdown complete');
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
}

// ==========================================
// GLOBAL INITIALIZATION
// ==========================================

/**
 * Global App instance
 */
let App = null;

/**
 * Initialize app globally
 * Usage: await initializeApp(CONFIG)
 */
async function initializeApp(config = CONFIG) {
    if (App?.isInitialized) {
        console.warn('⚠️  App already initialized');
        return App;
    }

    App = new AppBootstrap(config);
    await App.initialize();
    return App;
}

/**
 * Get app instance
 */
function getApp() {
    if (!App) {
        throw new Error('App not initialized. Call initializeApp(CONFIG) first.');
    }
    return App;
}

// ==========================================
// AUTO-INITIALIZE (if CONFIG is available)
// ==========================================

/**
 * If running in browser and CONFIG is available, auto-initialize on DOM ready
 */
if (typeof window !== 'undefined' && typeof CONFIG !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeApp(CONFIG).catch(error => {
                console.error('Failed to initialize app:', error);
            });
        });
    } else {
        // DOM already loaded
        initializeApp(CONFIG).catch(error => {
            console.error('Failed to initialize app:', error);
        });
    }
}

// ==========================================
// SHUTDOWN ON PAGE UNLOAD
// ==========================================

window.addEventListener('beforeunload', () => {
    if (App?.isInitialized) {
        App.shutdown();
    }
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppBootstrap, initializeApp, getApp };
}
