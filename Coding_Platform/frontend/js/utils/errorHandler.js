/**
 * Error Handler Utilities
 * 
 * Centralized error handling and user feedback utilities.
 * Components use these to show toasts, modals, and error states.
 */

class ErrorHandler {
    constructor(config) {
        this.config = config;
        this.toastContainer = null;
        this.initToastContainer();
    }

    /**
     * Initialize toast container
     */
    initToastContainer() {
        if (document.getElementById('toast-container')) return;

        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        this.toastContainer = container;
    }

    /**
     * Show toast notification
     * Types: 'success', 'error', 'warning', 'info'
     */
    showToast(message, type = 'info', duration = null) {
        const toast = document.createElement('div');
        const bgColor = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        }[type] || '#3b82f6';

        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        }[type];

        toast.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 10px;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        toast.innerHTML = `${icon} ${message}`;

        this.toastContainer.appendChild(toast);

        // Auto-remove
        const timeout = duration || this.config.UI.NOTIFICATIONS.DURATION_MS;
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, timeout);
    }

    /**
     * Show success toast
     */
    success(message, duration) {
        this.showToast(message, 'success', duration);
    }

    /**
     * Show error toast
     */
    error(message, duration) {
        this.showToast(message, 'error', duration);
    }

    /**
     * Show warning toast
     */
    warning(message, duration) {
        this.showToast(message, 'warning', duration);
    }

    /**
     * Show info toast
     */
    info(message, duration) {
        this.showToast(message, 'info', duration);
    }

    /**
     * Show loader
     */
    showLoader(message = 'Loading...') {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            `;
            document.body.appendChild(loader);
        }

        loader.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e5e7eb;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                "></div>
                <p style="margin: 0; color: #6b7280;">${message}</p>
            </div>
        `;
        loader.style.display = 'flex';
    }

    /**
     * Hide loader
     */
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Show error modal
     */
    showErrorModal(title, message, details = null) {
        let modal = document.getElementById('error-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'error-modal';
            document.body.appendChild(modal);
        }

        let detailsHTML = '';
        if (details && this.config.ERRORS.SHOW_DETAILS) {
            detailsHTML = `
                <details style="margin-top: 10px; font-size: 12px;">
                    <summary>Details</summary>
                    <pre style="
                        background: #f3f4f6;
                        padding: 10px;
                        border-radius: 4px;
                        overflow-x: auto;
                    ">${JSON.stringify(details, null, 2)}</pre>
                </details>
            `;
        }

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99998;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 500px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <h2 style="margin: 0 0 10px 0; color: #ef4444;">❌ ${title}</h2>
                <p style="margin: 0 0 10px 0; color: #4b5563;">${message}</p>
                ${detailsHTML}
                <button onclick="this.closest('div').parentElement.remove()" style="
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Close</button>
            </div>
        `;
    }

    /**
     * Handle API error and show appropriate feedback
     */
    handleApiError(error, context = '') {
        console.error(`❌ API Error (${context}):`, error);

        let message = 'An error occurred. Please try again.';

        if (error.status === 401) {
            message = 'Unauthorized. Please log in again.';
            // TODO: Redirect to login
        } else if (error.status === 403) {
            message = 'You do not have permission to perform this action.';
        } else if (error.status === 404) {
            message = 'Resource not found.';
        } else if (error.status === 429) {
            message = 'Too many requests. Please wait a moment and try again.';
        } else if (error.status >= 500) {
            message = 'Server error. Please try again later.';
        } else if (error instanceof TypeError) {
            message = 'Network error. Please check your connection.';
        } else if (error.message) {
            message = error.message;
        }

        this.error(message);
    }

    /**
     * Validate required fields
     */
    validateRequired(fields) {
        const errors = {};
        for (const [key, value] of Object.entries(fields)) {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors[key] = `${key} is required`;
            }
        }
        return errors;
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Show validation errors from form
     */
    showValidationErrors(form, errors) {
        // Clear previous error displays
        form.querySelectorAll('.error-message').forEach(el => el.remove());

        // Show errors for each field
        for (const [fieldName, errorMessage] of Object.entries(errors)) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                errorEl.style.cssText = `
                    color: #ef4444;
                    font-size: 12px;
                    display: block;
                    margin-top: 4px;
                `;
                errorEl.textContent = errorMessage;
                field.parentNode.insertBefore(errorEl, field.nextSibling);

                // Add error state to field
                field.style.borderColor = '#ef4444';
            }
        }
    }
}

// Global instance
let errorHandler = null;

/**
 * Initialize Error Handler globally
 */
function initializeErrorHandler(config) {
    errorHandler = new ErrorHandler(config);
    console.log('✅ Error Handler Initialized');
    return errorHandler;
}

/**
 * Get global Error Handler instance
 */
function getErrorHandler() {
    if (!errorHandler) {
        throw new Error('Error Handler not initialized.');
    }
    return errorHandler;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler, initializeErrorHandler, getErrorHandler };
}
