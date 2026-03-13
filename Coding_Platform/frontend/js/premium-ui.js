/* ========================================
   PREMIUM UI - Interactive Components
   ======================================== */

class PremiumUI {
    constructor() {
        this.timerInterval = null;
        this.timeRemaining = 0;
        this.isConnected = false;
        this.leaderboardUpdateTimeout = null;
        this.init();
    }

    /* ========================================
       INITIALIZATION
       ======================================== */

    init() {
        // Initialize all components on page load
        this.setupEventListeners();
        this.initializeTimer();
        this.initializeConnectionStatus();
        this.initializeLeaderboard();
        this.initializeEditor();
        this.initializeModals();
        this.setupFormValidation();
    }

    /* ========================================
       EVENT LISTENERS
       ======================================== */

    setupEventListeners() {
        // Primary Action Buttons
        const runBtn = document.getElementById('runBtn');
        const submitBtn = document.getElementById('submitBtn');
        const formatBtn = document.getElementById('formatBtn');
        const clearBtn = document.getElementById('clearBtn');

        if (runBtn) {
            runBtn.addEventListener('click', () => this.handleRunCode());
        }
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.handleSubmitCode());
        }
        if (formatBtn) {
            formatBtn.addEventListener('click', () => this.handleFormatCode());
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClearCode());
        }

        // Language Selector
        const languageDropdown = document.getElementById('languageDropdown');
        if (languageDropdown) {
            languageDropdown.addEventListener('change', (e) => this.handleLanguageChange(e));
        }

        // Modal Controls
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsBtn = document.querySelector('#settingsModal .close-btn');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        }
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.closeModal('settingsModal'));
        }

        // Modal Background Click to Close
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Refreshes
        const refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
        if (refreshLeaderboardBtn) {
            refreshLeaderboardBtn.addEventListener('click', () => this.refreshLeaderboard());
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window Resize - Responsive Adjustments
        window.addEventListener('resize', () => this.handleResponsiveAdjustments());
    }

    /* ========================================
       TIMER MANAGEMENT
       ======================================== */

    initializeTimer() {
        // Set initial time (example: 60 minutes)
        this.timeRemaining = 60 * 60; // in seconds

        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => this.tickTimer(), 1000);
    }

    tickTimer() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            this.updateTimerDisplay();

            // Warn when time is running out
            if (this.timeRemaining === 300) { // 5 minutes
                this.showNotification('Time Warning', '5 minutes remaining!', 'warning');
            }

            // Alert when time is up
            if (this.timeRemaining === 0) {
                this.handleTimeExpired();
            }
        }
    }

    updateTimerDisplay() {
        const timerValue = document.getElementById('timerValue');
        if (timerValue) {
            const hours = Math.floor(this.timeRemaining / 3600);
            const minutes = Math.floor((this.timeRemaining % 3600) / 60);
            const seconds = this.timeRemaining % 60;

            const display = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timerValue.textContent = display;

            // Flash effect when time is critical (< 2 minutes)
            if (this.timeRemaining < 120 && this.timeRemaining > 0) {
                timerValue.classList.add('time-critical');
            } else {
                timerValue.classList.remove('time-critical');
            }
        }
    }

    handleTimeExpired() {
        clearInterval(this.timerInterval);
        this.showNotification('Time Expired', 'Your contest time has ended.', 'error');
        this.disablePrimaryButtons();
    }

    /* ========================================
       CONNECTION STATUS
       ======================================== */

    initializeConnectionStatus() {
        // Simulate WebSocket connection
        setTimeout(() => {
            this.updateConnectionStatus(true);
        }, 500);
    }

    updateConnectionStatus(isConnected) {
        this.isConnected = isConnected;
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('connectionText');

        if (statusDot && statusText) {
            if (isConnected) {
                statusDot.classList.add('connected');
                statusDot.classList.remove('disconnected');
                statusText.textContent = 'Connected';
                statusText.style.color = 'var(--color-secondary)';
            } else {
                statusDot.classList.add('disconnected');
                statusDot.classList.remove('connected');
                statusText.textContent = 'Disconnected';
                statusText.style.color = 'var(--color-error)';
            }
        }
    }

    /* ========================================
       LEADERBOARD MANAGEMENT
       ======================================== */

    initializeLeaderboard() {
        // Sample leaderboard data
        this.sampleLeaderboardData = [
            { rank: 1, name: 'Alice Chen', avatar: 'AC', score: 450 },
            { rank: 2, name: 'Bob Johnson', avatar: 'BJ', score: 420 },
            { rank: 3, name: 'Charlie Davis', avatar: 'CD', score: 380 },
            { rank: 4, name: 'Diana Prince', avatar: 'DP', score: 350 },
            { rank: 5, name: 'You', avatar: 'YOU', score: 320, isCurrentUser: true }
        ];

        this.populateLeaderboard(this.sampleLeaderboardData);
    }

    populateLeaderboard(data) {
        const tbody = document.querySelector('.leaderboard-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const medals = {
            1: '🥇',
            2: '🥈',
            3: '🥉'
        };

        data.forEach(player => {
            const row = document.createElement('tr');
            if (player.isCurrentUser) {
                row.classList.add('current-user-row');
            }

            const medal = medals[player.rank] || '';
            const avatar = player.avatar || 'U';

            row.innerHTML = `
                <td class="col-rank">
                    <span class="rank-badge rank-${player.rank}">
                        ${medal} ${player.rank}
                    </span>
                </td>
                <td class="col-player">
                    <div class="player-info">
                        <span class="player-avatar">${avatar}</span>
                        <span class="player-name">${player.name}</span>
                    </div>
                </td>
                <td class="col-score">${player.score}</td>
                <td class="col-time">${this.formatTime()}</td>
            `;

            tbody.appendChild(row);
        });
    }

    updateLeaderboardRow(rankPosition, newScore) {
        const rows = document.querySelectorAll('.leaderboard-table tbody tr');
        const targetRow = rows[rankPosition - 1];

        if (targetRow) {
            // Add highlight animation
            targetRow.classList.add('highlight');

            // Update score
            const scoreCell = targetRow.querySelector('.col-score');
            if (scoreCell) {
                scoreCell.textContent = newScore;
            }

            // Remove highlight after animation
            this.leaderboardUpdateTimeout = setTimeout(() => {
                targetRow.classList.remove('highlight');
            }, 1000);
        }
    }

    refreshLeaderboard() {
        const refreshBtn = document.getElementById('refreshLeaderboardBtn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.style.opacity = '0.5';

            // Simulate API call
            setTimeout(() => {
                // Shuffle and update scores slightly
                const updatedData = this.sampleLeaderboardData.map(player => ({
                    ...player,
                    score: player.score + Math.floor(Math.random() * 20)
                }));

                this.sampleLeaderboardData = updatedData.sort((a, b) => b.score - a.score)
                    .map((p, i) => ({ ...p, rank: i + 1 }));

                this.populateLeaderboard(this.sampleLeaderboardData);

                refreshBtn.disabled = false;
                refreshBtn.style.opacity = '1';

                this.showNotification('Leaderboard Updated', 'Rankings refreshed', 'success');
            }, 800);
        }
    }

    /* ========================================
       EDITOR INTERACTIONS
       ======================================== */

    initializeEditor() {
        // Monaco Editor initialization (assumes Monaco is loaded globally)
        const editorContainer = document.getElementById('monacoEditor');
        if (editorContainer && typeof monaco !== 'undefined') {
            this.setupMonacoEditor();
        }

        // Fallback textarea if Monaco not available
        const fallbackEditor = document.getElementById('codeInput');
        if (fallbackEditor) {
            fallbackEditor.addEventListener('input', () => this.updateCodeStats());
        }
    }

    setupMonacoEditor() {
        // This will be called when Monaco is ready
        // Configure Monaco editor options
        if (typeof monaco !== 'undefined' && typeof editor !== 'undefined') {
            editor.updateOptions({
                theme: 'vs-dark',
                fontSize: 14,
                fontFamily: 'JetBrains Mono',
                wordWrap: 'on',
                minimap: { enabled: false }
            });

            editor.onDidChangeModelContent(() => {
                this.updateCodeStats();
            });
        }
    }

    handleFormatCode() {
        // Format code (implement based on language)
        this.showNotification('Formatting Code', 'Code formatted successfully', 'success');
        
        // Add animation
        const formatBtn = document.getElementById('formatBtn');
        if (formatBtn) {
            formatBtn.classList.add('pulse-animation');
            setTimeout(() => formatBtn.classList.remove('pulse-animation'), 300);
        }
    }

    handleClearCode() {
        // Confirm before clearing
        if (confirm('Are you sure you want to clear your code?')) {
            const fallbackEditor = document.getElementById('codeInput');
            if (fallbackEditor) {
                fallbackEditor.value = '';
                this.updateCodeStats();
            }
            if (typeof editor !== 'undefined') {
                editor.setValue('');
            }
            this.showNotification('Code Cleared', 'Editor has been cleared', 'info');
        }
    }

    handleLanguageChange(event) {
        const language = event.target.value;
        console.log('Language changed to:', language);

        // Update Monaco language (if available)
        if (typeof monaco !== 'undefined' && typeof editor !== 'undefined') {
            monaco.editor.setModelLanguage(editor.getModel(), language);
        }

        this.showNotification('Language Changed', `Switched to ${language}`, 'info');
    }

    updateCodeStats() {
        const fallbackEditor = document.getElementById('codeInput');
        const lineCount = document.getElementById('codeLines');
        const charCount = document.getElementById('codeChars');

        if (fallbackEditor && lineCount && charCount) {
            const code = fallbackEditor.value;
            const lines = code.split('\n').length;
            const chars = code.length;

            lineCount.textContent = lines;
            charCount.textContent = chars;

            // Add update animation
            lineCount.classList.add('updated');
            charCount.classList.add('updated');

            setTimeout(() => {
                lineCount.classList.remove('updated');
                charCount.classList.remove('updated');
            }, 300);
        }
    }

    /* ========================================
       CODE EXECUTION & SUBMISSION
       ======================================== */

    handleRunCode() {
        const runBtn = document.getElementById('runBtn');
        if (!runBtn) return;

        // Add loading state
        runBtn.disabled = true;
        runBtn.innerHTML = '<span class="loading-spinner small"></span> Running...';

        // Simulate code execution
        setTimeout(() => {
            const testResults = `
                Test 1: ✓ PASSED (12ms)
                Test 2: ✓ PASSED (14ms)
                Test 3: ✗ FAILED (15ms)
                  Expected: [1,2,3]
                  Got: [1,2]
            `;

            this.displayTestResults(testResults, false);
            runBtn.disabled = false;
            runBtn.innerHTML = '<span class="btn-icon">▶</span> Run Code';

            this.showNotification('Run Complete', '2/3 tests passed', 'warning');
        }, 2000);
    }

    handleSubmitCode() {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;

        // Confirm submission
        if (!confirm('Submit your solution? You cannot change it after submission.')) {
            return;
        }

        // Add loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner small"></span> Submitting...';

        // Simulate submission
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% success rate
            
            if (success) {
                this.showSubmissionSuccess();
                submitBtn.disabled = true;
                submitBtn.textContent = '✓ Accepted';
                submitBtn.style.backgroundColor = 'var(--color-secondary)';
            } else {
                this.showSubmissionError();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="btn-icon">✓</span> Submit';
            }
        }, 2500);
    }

    displayTestResults(results, success) {
        const feedbackElement = this.createFeedbackElement('Test Results', results, success ? 'success' : 'partial');
        const controlBar = document.querySelector('.control-bar');
        if (controlBar) {
            const existingFeedback = controlBar.querySelector('.submission-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            controlBar.insertBefore(feedbackElement, controlBar.firstChild);
        }
    }

    showSubmissionSuccess() {
        const feedback = `
            <div class="feedback-header">✓ Accepted</div>
            Runtime: 45ms | Memory: 42.3MB<br>
            <strong>+10 points earned</strong><br>
            Rank: 4→3 (Advanced one position!)
        `;
        const feedbackElement = this.createFeedbackElement('Submission', feedback, 'success');
        
        const controlBar = document.querySelector('.control-bar');
        if (controlBar) {
            const existingFeedback = controlBar.querySelector('.submission-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            controlBar.insertBefore(feedbackElement, controlBar.firstChild);
        }

        // Update leaderboard
        setTimeout(() => {
            this.updateLeaderboardRow(3, 350 + 10);
        }, 500);
    }

    showSubmissionError() {
        const feedback = `
            <div class="feedback-header">✗ Wrong Answer</div>
            Test case 5 failed<br>
            <strong>Hint:</strong> Check your edge case handling
        `;
        const feedbackElement = this.createFeedbackElement('Submission', feedback, 'error');
        
        const controlBar = document.querySelector('.control-bar');
        if (controlBar) {
            const existingFeedback = controlBar.querySelector('.submission-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            controlBar.insertBefore(feedbackElement, controlBar.firstChild);
        }
    }

    createFeedbackElement(title, message, type) {
        const element = document.createElement('div');
        element.className = `submission-feedback ${type}`;
        element.innerHTML = message;
        return element;
    }

    /* ========================================
       MODAL MANAGEMENT
       ======================================== */

    initializeModals() {
        // Settings form interactions
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.handleSettingsSave(e));
        }

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    handleSettingsSave(event) {
        event.preventDefault();
        
        // Collect form data
        const formData = new FormData(event.target);
        const settings = Object.fromEntries(formData);

        // Save to localStorage
        localStorage.setItem('premiumUISettings', JSON.stringify(settings));

        this.showNotification('Settings Saved', 'Your preferences have been saved', 'success');
        this.closeModal('settingsModal');
    }

    /* ========================================
       FORM VALIDATION
       ======================================== */

    setupFormValidation() {
        // Example: Add visual feedback to form inputs
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.classList.add('focused');
            });

            input.addEventListener('blur', (e) => {
                e.target.classList.remove('focused');
            });

            input.addEventListener('invalid', (e) => {
                e.target.classList.add('invalid');
            });

            input.addEventListener('input', (e) => {
                e.target.classList.remove('invalid');
            });
        });
    }

    /* ========================================
       NOTIFICATIONS
       ======================================== */

    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">${title}</div>
            <div class="notification-message">${message}</div>
        `;

        // Container for notifications
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    /* ========================================
       KEYBOARD SHORTCUTS
       ======================================== */

    handleKeyboardShortcuts(event) {
        // Ctrl+Enter or Cmd+Enter - Submit code
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.handleSubmitCode();
        }

        // Ctrl+Shift+F or Cmd+Shift+F - Format code
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'f') {
            event.preventDefault();
            this.handleFormatCode();
        }

        // F12 - Toggle settings
        if (event.key === 'F5') {
            event.preventDefault();
            this.openModal('settingsModal');
        }
    }

    /* ========================================
       RESPONSIVE ADJUSTMENTS
       ======================================== */

    handleResponsiveAdjustments() {
        const width = window.innerWidth;

        if (width < 1200) {
            // Tablet view
            document.body.classList.add('tablet-view');
            document.body.classList.remove('mobile-view');
        } else if (width < 768) {
            // Mobile view
            document.body.classList.add('mobile-view');
            document.body.classList.remove('tablet-view');
        } else {
            // Desktop view
            document.body.classList.remove('tablet-view', 'mobile-view');
        }
    }

    /* ========================================
       UTILITY FUNCTIONS
       ======================================== */

    formatTime() {
        const now = new Date();
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    disablePrimaryButtons() {
        const runBtn = document.getElementById('runBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (runBtn) runBtn.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
    }

    /* ========================================
       LIFECYCLE METHODS
       ======================================== */

    destroy() {
        // Cleanup on page unload
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.leaderboardUpdateTimeout) {
            clearTimeout(this.leaderboardUpdateTimeout);
        }
    }
}

/* ========================================
   INITIALIZE PREMIUM UI ON DOM READY
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    window.premiumUI = new PremiumUI();
});

/* ========================================
   CLEANUP ON PAGE UNLOAD
   ======================================== */

window.addEventListener('beforeunload', () => {
    if (window.premiumUI) {
        window.premiumUI.destroy();
    }
});
