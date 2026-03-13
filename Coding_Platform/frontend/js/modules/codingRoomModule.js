/**
 * Coding Room Module
 * 
 * Manages the main coding contest interface:
 * - Problem display
 * - Code editor integration
 * - Real-time leaderboard updates
 * - Code submission
 * - WebSocket event handling
 */

class CodingRoomModule {
  constructor(apiService, socketService, authService) {
    this.apiService = apiService;
    this.socketService = socketService;
    this.authService = authService;

    this.currentProblem = null;
    this.currentCode = '';
    this.selectedLanguage = 'javascript';
    this.editor = null;
    this.tournamentId = null;
    this.problemId = null;
    this.leaderboard = [];

    this.initializeEventListeners();
  }

  /**
   * Initialize the coding room page
   */
  async initialize() {
    console.log('🚀 Initializing Coding Room...');

    // Get tournament and problem from URL
    const params = new URLSearchParams(window.location.search);
    this.tournamentId = params.get('tournament');
    this.problemId = params.get('problem');

    // Load problem details
    await this.loadProblem();

    // Initialize Monaco Editor
    this.initializeMonacoEditor();

    // Connect to WebSocket for real-time updates
    this.socketService.on('leaderboard-update', (data) => this.onLeaderboardUpdate(data));
    this.socketService.on('submission-result', (data) => this.onSubmissionResult(data));
    this.socketService.on('timer-update', (data) => this.onTimerUpdate(data));

    console.log('✅ Coding Room initialized');
  }

  /**
   * Load problem details from API
   */
  async loadProblem() {
    try {
      const problem = await this.apiService.getProblem(this.tournamentId, this.problemId);
      this.currentProblem = problem;
      this.renderProblem();
      this.loadProblemTemplate();
    } catch (error) {
      console.error('❌ Failed to load problem:', error);
      this.showError('Failed to load problem details');
    }
  }

  /**
   * Render problem statement in left panel
   */
  renderProblem() {
    if (!this.currentProblem) return;

    const problemPanel = document.getElementById('problem-panel');
    if (!problemPanel) return;

    problemPanel.innerHTML = `
      <div class="problem-header">
        <h2>${this.currentProblem.title}</h2>
        <div class="problem-meta">
          <span class="difficulty difficulty-${this.currentProblem.difficulty}">
            ${this.currentProblem.difficulty.toUpperCase()}
          </span>
          <span class="acceptance-rate">
            ${this.currentProblem.acceptanceRate}% Acceptance
          </span>
        </div>
      </div>

      <div class="problem-description">
        <h3>Description</h3>
        <p>${this.currentProblem.description}</p>

        <h3>Examples</h3>
        ${this.currentProblem.examples.map((ex, idx) => `
          <div class="example">
            <strong>Example ${idx + 1}:</strong>
            <div class="example-io">
              <div><strong>Input:</strong> <code>${ex.input}</code></div>
              <div><strong>Output:</strong> <code>${ex.output}</code></div>
              ${ex.explanation ? `<div><strong>Explanation:</strong> ${ex.explanation}</div>` : ''}
            </div>
          </div>
        `).join('')}

        <h3>Constraints</h3>
        <ul>
          ${this.currentProblem.constraints.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Initialize Monaco Editor
   */
  initializeMonacoEditor() {
    const editorElement = document.getElementById('editor-container');
    if (!editorElement) return;

    // Load Monaco Editor from CDN
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});

    require(['vs/editor/editor.main'], () => {
      this.editor = monaco.editor.create(editorElement, {
        value: this.getCodeTemplate(this.selectedLanguage),
        language: this.getMonacoLanguage(this.selectedLanguage),
        theme: 'vs-dark',
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        insertSpaces: true,
        automaticLayout: true
      });

      this.editor.onDidChangeModelContent(() => {
        this.currentCode = this.editor.getValue();
      });
    });
  }

  /**
   * Get code template for language
   */
  getCodeTemplate(language) {
    const templates = {
      javascript: `function solution(arr) {
  // Write your solution here
  return arr;
}

// Don't modify the line below
module.exports = solution;`,
      python: `def solution(arr):
    # Write your solution here
    return arr`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> solution(vector<int>& arr) {
    // Write your solution here
    return arr;
}`,
      java: `class Solution {
    public int[] solution(int[] arr) {
        // Write your solution here
        return arr;
    }
}`
    };
    return templates[language] || templates.javascript;
  }

  /**
   * Map language to Monaco language ID
   */
  getMonacoLanguage(language) {
    const map = {
      javascript: 'javascript',
      python: 'python',
      cpp: 'cpp',
      java: 'java'
    };
    return map[language] || 'javascript';
  }

  /**
   * Load problem-specific code template
   */
  loadProblemTemplate() {
    if (this.editor && this.currentProblem?.template) {
      this.editor.setValue(this.currentProblem.template[this.selectedLanguage] || '');
    }
  }

  /**
   * Change programming language
   */
  changeLanguage(language) {
    this.selectedLanguage = language;
    if (this.editor) {
      const model = this.editor.getModel();
      monaco.editor.setModelLanguage(model, this.getMonacoLanguage(language));
      this.editor.setValue(this.getCodeTemplate(language));
    }
  }

  /**
   * Run code (test with examples)
   */
  async runCode() {
    try {
      this.showStatus('Running tests...');

      const result = await this.apiService.runCode({
        tournamentId: this.tournamentId,
        problemId: this.problemId,
        code: this.currentCode,
        language: this.selectedLanguage
      });

      this.displayRunResults(result);
    } catch (error) {
      this.showError('Failed to run code: ' + error.message);
    }
  }

  /**
   * Submit final solution
   */
  async submitCode() {
    try {
      if (!this.currentCode.trim()) {
        this.showError('Please write some code before submitting');
        return;
      }

      this.showStatus('Submitting solution...');

      const result = await this.apiService.submitCode({
        tournamentId: this.tournamentId,
        problemId: this.problemId,
        code: this.currentCode,
        language: this.selectedLanguage
      });

      if (result.success) {
        this.showSuccess('✓ Solution submitted!');
        // Emit event to update user stats
        this.socketService.emit('problem-solved', {
          tournamentId: this.tournamentId,
          problemId: this.problemId
        });
      } else {
        this.showError('Submission failed: ' + result.message);
      }
    } catch (error) {
      this.showError('Failed to submit: ' + error.message);
    }
  }

  /**
   * Reset code to template
   */
  resetCode() {
    if (confirm('Are you sure? This will discard all changes.')) {
      this.loadProblemTemplate();
    }
  }

  /**
   * Format code
   */
  formatCode() {
    if (this.editor) {
      this.editor.getAction('editor.action.formatDocument').run();
    }
  }

  /**
   * Display run results
   */
  displayRunResults(result) {
    const outputPanel = document.getElementById('output-panel');
    if (!outputPanel) return;

    let html = '<h3>Test Results</h3>';

    if (result.testCases) {
      result.testCases.forEach((testCase, idx) => {
        html += `
          <div class="test-case ${testCase.passed ? 'passed' : 'failed'}">
            <div class="test-case-status">
              ${testCase.passed ? '✓ Passed' : '✗ Failed'} - Test Case ${idx + 1}
            </div>
            <div class="test-case-output">
              <div><strong>Input:</strong> <code>${testCase.input}</code></div>
              <div><strong>Expected:</strong> <code>${testCase.expected}</code></div>
              <div><strong>Got:</strong> <code>${testCase.actual}</code></div>
              ${testCase.error ? `<div class="error"><strong>Error:</strong> ${testCase.error}</div>` : ''}
            </div>
          </div>
        `;
      });
    }

    if (result.summary) {
      html += `
        <div class="test-summary">
          <div>Passed: ${result.summary.passed}/${result.summary.total}</div>
          <div>Time: ${result.summary.executionTime}ms</div>
        </div>
      `;
    }

    outputPanel.innerHTML = html;
  }

  /**
   * Handle leaderboard updates from WebSocket
   */
  onLeaderboardUpdate(data) {
    this.leaderboard = data.leaderboard || [];
    this.renderLeaderboard();
  }

  /**
   * Render live leaderboard
   */
  renderLeaderboard() {
    const leaderboardPanel = document.getElementById('leaderboard-panel');
    if (!leaderboardPanel) return;

    let html = '<h3>Live Leaderboard</h3><div class="leaderboard">';

    this.leaderboard.slice(0, 20).forEach((entry, idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
      html += `
        <div class="leaderboard-entry">
          <span class="rank">${medal || idx + 1}</span>
          <span class="name">${entry.username}</span>
          <span class="problems">${entry.problemsSolved}</span>
          <span class="score">${entry.score}</span>
        </div>
      `;
    });

    html += '</div>';
    leaderboardPanel.innerHTML = html;
  }

  /**
   * Handle submission result from WebSocket
   */
  onSubmissionResult(data) {
    if (data.submissionId === this.lastSubmissionId) {
      if (data.accepted) {
        this.showSuccess('🎉 Accepted! Your solution is correct.');
      } else {
        this.showError('❌ Wrong Answer');
      }
    }
  }

  /**
   * Handle timer updates
   */
  onTimerUpdate(data) {
    const timerElement = document.getElementById('countdown-timer');
    if (timerElement) {
      timerElement.textContent = data.remainingTime;
    }
  }

  /**
   * Show status message
   */
  showStatus(message) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = 'status-message status-info';
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = 'status-message status-success';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const statusElement = document.getElementById('status-message');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = 'status-message status-error';
    }
  }

  /**
   * Initialize event listeners
   */
  initializeEventListeners() {
    // Language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    }

    // Run Code button
    const runBtn = document.getElementById('run-code-btn');
    if (runBtn) {
      runBtn.addEventListener('click', () => this.runCode());
    }

    // Submit Code button
    const submitBtn = document.getElementById('submit-code-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitCode());
    }

    // Reset Code button
    const resetBtn = document.getElementById('reset-code-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetCode());
    }

    // Format Code button
    const formatBtn = document.getElementById('format-code-btn');
    if (formatBtn) {
      formatBtn.addEventListener('click', () => this.formatCode());
    }
  }
}
