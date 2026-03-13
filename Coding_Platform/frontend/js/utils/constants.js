/**
 * Constants
 * 
 * Centralized constants for the application
 */

const CONSTANTS = {
    // Common HTTP status codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        RATE_LIMITED: 429,
        SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503
    },

    // API error types
    ERROR_TYPES: {
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
        AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
        NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
        CONFLICT_ERROR: 'CONFLICT_ERROR',
        SERVER_ERROR: 'SERVER_ERROR',
        NETWORK_ERROR: 'NETWORK_ERROR',
        TIMEOUT_ERROR: 'TIMEOUT_ERROR',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    },

    // Problem difficulty levels
    DIFFICULTY: {
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard'
    },

    // Difficulty colors
    DIFFICULTY_COLOR: {
        easy: '#10b981',
        medium: '#f59e0b',
        hard: '#ef4444'
    },

    // Problem status
    PROBLEM_STATUS: {
        NOT_ATTEMPTED: 'not_attempted',
        SOLVED: 'solved',
        ATTEMPTED: 'attempted'
    },

    // Submission verdict
    VERDICT: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        WRONG_ANSWER: 'wrong_answer',
        TIME_LIMIT_EXCEEDED: 'time_limit_exceeded',
        MEMORY_LIMIT_EXCEEDED: 'memory_limit_exceeded',
        RUNTIME_ERROR: 'runtime_error',
        COMPILATION_ERROR: 'compilation_error',
        PRESENTATION_ERROR: 'presentation_error'
    },

    // Verdict colors
    VERDICT_COLOR: {
        accepted: '#10b981',
        wrong_answer: '#ef4444',
        time_limit_exceeded: '#f59e0b',
        memory_limit_exceeded: '#f59e0b',
        runtime_error: '#ef4444',
        compilation_error: '#ef4444',
        presentation_error: '#f59e0b',
        pending: '#6b7280'
    },

    // Tournament status
    TOURNAMENT_STATUS: {
        UPCOMING: 'upcoming',
        ACTIVE: 'active',
        PAUSED: 'paused',
        ENDED: 'ended'
    },

    // User roles
    ROLES: {
        USER: 'user',
        MODERATOR: 'moderator',
        ADMIN: 'admin'
    },

    // User permissions
    PERMISSIONS: {
        CREATE_TOURNAMENT: 'create_tournament',
        DELETE_TOURNAMENT: 'delete_tournament',
        UPDATE_TOURNAMENT: 'update_tournament',
        CREATE_PROBLEM: 'create_problem',
        DELETE_PROBLEM: 'delete_problem',
        UPDATE_PROBLEM: 'update_problem',
        SUBMIT_CODE: 'submit_code',
        VIEW_LEADERBOARD: 'view_leaderboard',
        MANAGE_USERS: 'manage_users'
    },

    // Code language configurations
    LANGUAGES: {
        javascript: {
            id: 'javascript',
            name: 'JavaScript',
            ext: '.js',
            monacoLang: 'javascript',
            template: `function solution(input) {
    // TODO: Implement solution
    return output;
}`
        },
        python: {
            id: 'python',
            name: 'Python',
            ext: '.py',
            monacoLang: 'python',
            template: `def solution(input):
    # TODO: Implement solution
    return output`
        },
        java: {
            id: 'java',
            name: 'Java',
            ext: '.java',
            monacoLang: 'java',
            template: `public class Solution {
    public Object solution(String input) {
        // TODO: Implement solution
        return output;
    }
}`
        },
        cpp: {
            id: 'cpp',
            name: 'C++',
            ext: '.cpp',
            monacoLang: 'cpp',
            template: `#include <iostream>
using namespace std;

int main() {
    // TODO: Implement solution
    return 0;
}`
        }
    },

    // Local storage keys
    STORAGE_KEYS: {
        TOKEN: 'app_token',
        USER: 'app_user',
        SETTINGS: 'app_settings',
        THEME: 'app_theme',
        RECENT_PROBLEMS: 'app_recent_problems',
        DRAFT_CODE: 'app_draft_code'
    },

    // Event names (for custom events)
    EVENTS: {
        AUTH_CHANGED: 'authChanged',
        LANGUAGE_CHANGED: 'languageChanged',
        CODE_CHANGED: 'codeChanged',
        PROBLEM_LOADED: 'problemLoaded',
        TOURNAMENT_JOINED: 'tournamentJoined',
        TOURNAMENT_LEFT: 'tournamentLeft',
        SUBMISSION_STARTED: 'submissionStarted',
        SUBMISSION_COMPLETED: 'submissionCompleted'
    },

    // Regex patterns
    PATTERNS: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    },

    // Validation rules
    VALIDATION: {
        MIN_USERNAME_LENGTH: 3,
        MAX_USERNAME_LENGTH: 20,
        MIN_PASSWORD_LENGTH: 8,
        MAX_CODE_LENGTH: 100000,
        MAX_FILE_SIZE_MB: 10
    },

    // Limits and thresholds
    LIMITS: {
        MAX_RETRY_ATTEMPTS: 3,
        REQUEST_TIMEOUT_MS: 30000,
        DEBOUNCE_DELAY_MS: 300,
        THROTTLE_DELAY_MS: 500,
        SESSION_TIMEOUT_MINUTES: 30,
        MAX_LEADERBOARD_ENTRIES: 100,
        MAX_SUBMISSIONS_PAGE: 50
    },

    // Default values
    DEFAULTS: {
        LANGUAGE: 'javascript',
        THEME: 'dark',
        ITEMS_PER_PAGE: 20,
        TIMEOUT_SECONDS: 5,
        MEMORY_LIMIT_MB: 256
    }
};

// Helper function to get language config
function getLanguageConfig(languageId) {
    return CONSTANTS.LANGUAGES[languageId] || CONSTANTS.LANGUAGES.javascript;
}

// Helper function to get verdict color
function getVerdictColor(verdict) {
    return CONSTANTS.VERDICT_COLOR[verdict] || '#6b7280';
}

// Helper function to get difficulty color
function getDifficultyColor(difficulty) {
    return CONSTANTS.DIFFICULTY_COLOR[difficulty] || '#3b82f6';
}

// Export constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONSTANTS, getLanguageConfig, getVerdictColor, getDifficultyColor };
}
