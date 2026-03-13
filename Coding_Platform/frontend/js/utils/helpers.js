/**
 * Helper Utilities
 * 
 * Reusable utility functions for common tasks
 */

/**
 * Debounce function - prevent rapid function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function - limit function call frequency
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Format time (seconds) to MM:SS or HH:MM:SS
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format date to readable format
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format date with time
 */
function formatDateTime(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get time remaining until date
 */
function getTimeRemaining(targetDate) {
    const now = Date.now();
    const target = new Date(targetDate).getTime();
    const remaining = Math.max(0, target - now);

    return {
        totalMs: remaining,
        seconds: Math.floor((remaining / 1000) % 60),
        minutes: Math.floor((remaining / 1000 / 60) % 60),
        hours: Math.floor((remaining / 1000 / 60 / 60) % 24),
        days: Math.floor(remaining / 1000 / 60 / 60 / 24)
    };
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('✅ Copied to clipboard');
        return true;
    } catch (error) {
        console.error('❌ Failed to copy:', error);
        return false;
    }
}

/**
 * Generate unique ID
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Check if object is empty
 */
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects recursively
 */
function merge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = merge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

/**
 * Wait/sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retry(func, maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2) {
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await func();
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts - 1) {
                const delay = delayMs * Math.pow(backoffMultiplier, attempt);
                console.log(`⏰ Retry attempt ${attempt + 1}/${maxAttempts} in ${delay}ms`);
                await sleep(delay);
            }
        }
    }
    throw lastError;
}

/**
 * Check if element is visible in viewport
 */
function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll element into view smoothly
 */
function scrollToElement(element, behavior = 'smooth') {
    element.scrollIntoView({ behavior, block: 'center' });
}

/**
 * Parallelize promise array (wait for all)
 */
function promiseAll(promises) {
    return Promise.all(promises);
}

/**
 * Parallelize promise array with error handling
 */
function promiseAllSettled(promises) {
    return Promise.allSettled(promises);
}

/**
 * Get query parameter from URL
 */
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Set query parameter in URL
 */
function setQueryParam(name, value) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

/**
 * Highlight code syntax (stub - implement with highlight.js or similar)
 */
function highlightCode(code, language = 'javascript') {
    // TODO: Integrate with highlight.js or similar library
    return code;
}

/**
 * Log with timestamp
 */
function log(message, type = 'log') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}]`;
    console[type](prefix, message);
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        throttle,
        formatTime,
        formatDate,
        formatDateTime,
        getTimeRemaining,
        formatFileSize,
        escapeHtml,
        copyToClipboard,
        generateUUID,
        isEmpty,
        deepClone,
        merge,
        sleep,
        retry,
        isElementVisible,
        scrollToElement,
        promiseAll,
        promiseAllSettled,
        getQueryParam,
        setQueryParam,
        highlightCode,
        log
    };
}
