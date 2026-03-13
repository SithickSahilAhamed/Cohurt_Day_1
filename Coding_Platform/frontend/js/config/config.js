/**
 * Config.js - Environment & Application Configuration
 * 
 * Centralized configuration for backend URLs, WebSocket connections,
 * and application settings. Easily customizable for different environments.
 * 
 * Backend developers: Update these URLs when deploying to different environments
 */

const CONFIG = {
    // ==========================================
    // ENVIRONMENT SETTINGS
    // ==========================================
    ENVIRONMENT: 'development', // 'development' | 'staging' | 'production'

    // ==========================================
    // API CONFIGURATION
    // ==========================================
    API: {
        // Base URL for all HTTP REST API calls
        // TODO: Backend - Update this URL based on your server
        BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',

        // Request timeout in milliseconds
        TIMEOUT: 10000,

        // Retry configuration for failed requests
        RETRY: {
            enabled: true,
            maxAttempts: 3,
            delayMs: 1000,
            backoffMultiplier: 2
        },

        // API endpoints (relative paths appended to BASE_URL)
        ENDPOINTS: {
            // Authentication endpoints
            AUTH: {
                LOGIN: '/auth/login',
                REGISTER: '/auth/register',
                LOGOUT: '/auth/logout',
                REFRESH_TOKEN: '/auth/refresh',
                VERIFY_TOKEN: '/auth/verify',
                PROFILE: '/auth/profile'
            },

            // Tournament endpoints
            TOURNAMENTS: {
                LIST: '/tournaments',
                GET_DETAIL: '/tournaments/{id}',
                JOIN: '/tournaments/{id}/join',
                LEAVE: '/tournaments/{id}/leave',
                LIST_PARTICIPANTS: '/tournaments/{id}/participants',
                GET_PROBLEMS: '/tournaments/{id}/problems'
            },

            // Coding/Problem endpoints
            PROBLEMS: {
                GET_DETAIL: '/problems/{id}',
                GET_EXAMPLES: '/problems/{id}/examples',
                SUBMIT_SOLUTION: '/problems/{id}/submit',
                GET_SUBMISSIONS: '/problems/{id}/submissions',
                GET_SUBMISSION_DETAIL: '/submissions/{id}'
            },

            // Code execution/judging endpoints
            JUDGE: {
                RUN_CODE: '/judge/run',
                SUBMIT_CODE: '/judge/submit',
                GET_RESULT: '/judge/result/{id}',
                GET_TESTCASES: '/judge/testcases/{id}'
            },

            // Leaderboard endpoints
            LEADERBOARD: {
                GET_GLOBAL: '/leaderboard/global',
                GET_TOURNAMENT: '/leaderboard/tournament/{id}',
                GET_USER_RANK: '/leaderboard/user-rank'
            },

            // User endpoints
            USERS: {
                GET_PROFILE: '/users/{id}',
                UPDATE_PROFILE: '/users/{id}',
                GET_STATISTICS: '/users/{id}/statistics',
                GET_SUBMISSIONS: '/users/{id}/submissions'
            },

            // Batch operations
            BATCH: {
                GET_MULTIPLE_PROBLEMS: '/problems/batch',
                GET_MULTIPLE_USERS: '/users/batch'
            }
        }
    },

    // ==========================================
    // WEBSOCKET CONFIGURATION
    // ==========================================
    SOCKET: {
        // WebSocket server URL (ws:// for insecure, wss:// for secure)
        // TODO: Backend - Update this URL based on your server
        URL: process.env.REACT_APP_SOCKET_URL || 'ws://localhost:5000',

        // Reconnection settings
        RECONNECT: {
            enabled: true,
            maxAttempts: 8,
            baseDelayMs: 2000,
            maxDelayMs: 30000,
            backoffMultiplier: 1.5
        },

        // Heartbeat/ping-pong settings (keep connection alive)
        HEARTBEAT: {
            enabled: true,
            intervalMs: 30000,
            timeoutMs: 5000
        },

        // WebSocket event names (backend should match these)
        EVENTS: {
            // Connection events
            CONNECT: 'socket:connect',
            DISCONNECT: 'socket:disconnect',
            ERROR: 'socket:error',

            // Tournament events
            TOURNAMENT_STARTED: 'tournament:started',
            TOURNAMENT_ENDED: 'tournament:ended',
            PARTICIPANT_JOINED: 'participant:joined',
            PARTICIPANT_LEFT: 'participant:left',

            // Live updates
            LEADERBOARD_UPDATE: 'leaderboard:update',
            SCORE_UPDATE: 'score:update',
            SUBMISSION_ACCEPTED: 'submission:accepted',
            SUBMISSION_REJECTED: 'submission:rejected',
            TEST_RESULT: 'test:result',

            // Timer events
            TIMER_UPDATE: 'timer:update',
            TIME_REMAINING: 'time:remaining',

            // User events
            USER_ONLINE: 'user:online',
            USER_OFFLINE: 'user:offline',

            // Chat/notifications
            MESSAGE: 'message',
            NOTIFICATION: 'notification',
            ALERT: 'alert'
        }
    },

    // ==========================================
    // AUTHENTICATION SETTINGS
    // ==========================================
    AUTH: {
        // Token storage key
        TOKEN_KEY: 'app_token',
        REFRESH_TOKEN_KEY: 'app_refresh_token',
        USER_KEY: 'app_user',

        // Token refresh settings
        REFRESH: {
            // Time before expiry to trigger refresh (in seconds)
            THRESHOLD: 300, // 5 minutes
            // Auto refresh tokens before expiry
            AUTO_REFRESH: true
        },

        // Session settings
        SESSION: {
            // Timeout duration (in minutes)
            TIMEOUT_MINUTES: 30,
            // Warn before logout (in seconds)
            WARN_BEFORE_LOGOUT: 60
        }
    },

    // ==========================================
    // APPLICATION SETTINGS
    // ==========================================
    APP: {
        // Application name
        NAME: 'CodeBattle Arena',

        // Application version
        VERSION: '1.0.0',

        // Default language for code editor
        DEFAULT_LANGUAGE: 'javascript',

        // Supported programming languages
        LANGUAGES: [
            'javascript',
            'python',
            'java',
            'cpp',
            'csharp',
            'go',
            'rust',
            'php',
            'ruby',
            'swift'
        ],

        // Pagination settings
        PAGINATION: {
            DEFAULT_PAGE_SIZE: 20,
            MAX_PAGE_SIZE: 100
        },

        // Debug mode (shows extra logs)
        DEBUG: true,

        // Feature flags (for gradual rollout)
        FEATURES: {
            LIVE_COLLABORATION: false,
            REAL_TIME_LEADERBOARD: true,
            CODE_SHARING: false,
            ACHIEVEMENTS: true,
            BADGES: true
        }
    },

    // ==========================================
    // UI CUSTOMIZATION
    // ==========================================
    UI: {
        // Theme settings
        THEME: 'dark', // 'dark' | 'light'

        // Animation settings
        ANIMATIONS_ENABLED: true,

        // Notification settings
        NOTIFICATIONS: {
            POSITION: 'top-right',
            DURATION_MS: 4000,
            MAX_STACK: 5
        },

        // Modal settings
        MODALS: {
            ANIMATE: true,
            CLOSE_ON_ESCAPE: true,
            CLOSE_ON_OUTSIDE_CLICK: true
        }
    },

    // ==========================================
    // PERFORMANCE SETTINGS
    // ==========================================
    PERFORMANCE: {
        // Cache settings
        CACHE: {
            ENABLED: true,
            ttlMinutes: 5
        },

        // Request debouncing (in milliseconds)
        DEBOUNCE: {
            SEARCH: 300,
            RESIZE: 200,
            SCROLL: 150
        }
    },

    // ==========================================
    // ERROR HANDLING
    // ==========================================
    ERRORS: {
        // Show detailed error messages
        SHOW_DETAILS: false,

        // Track errors in monitoring service
        TRACKING_ENABLED: true
    },

    // ==========================================
    // LOGGING
    // ==========================================
    LOGGING: {
        // Console logging level ('debug' | 'info' | 'warn' | 'error')
        LEVEL: 'debug',

        // Log to remote service
        REMOTE_LOGGING: false
    }
};

/**
 * Helper function to get nested config values
 * Usage: getConfig('API.ENDPOINTS.AUTH.LOGIN')
 */
function getConfig(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
}

/**
 * Helper to build full API URL
 * Usage: getApiUrl('AUTH.LOGIN')
 */
function getApiUrl(endpoint) {
    const path = getConfig(`API.ENDPOINTS.${endpoint}`);
    if (!path) {
        console.warn(`Endpoint not found: API.ENDPOINTS.${endpoint}`);
        return '';
    }
    return CONFIG.API.BASE_URL + path;
}

/**
 * Helper to build full WebSocket URL with path
 * Usage: getSocketUrl('/coding/tournament/123')
 */
function getSocketUrl(path = '') {
    return CONFIG.SOCKET.URL + path;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getConfig, getApiUrl, getSocketUrl };
}
