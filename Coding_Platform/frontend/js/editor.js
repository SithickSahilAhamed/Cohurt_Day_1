/**
 * Editor.js - Monaco Editor Integration
 * Handles editor initialization, language configuration, and code management
 */

class MonacoEditorManager {
    constructor() {
        this.editor = null;
        this.models = {};
        this.currentLanguage = 'javascript';
        this.editorContainer = document.getElementById('monacoEditorContainer');
        this.monaco = null;
        this.isReady = false;
        this.pendingOperations = [];
        
        // DOM Elements
        this.languageSelect = document.getElementById('languageSelect');
        this.themeToggle = document.getElementById('themeToggle');
        this.wordWrapToggle = document.getElementById('wordWrapToggle');
        this.formatBtn = document.getElementById('formatCodeBtn');
        this.clearBtn = document.getElementById('clearCodeBtn');
        this.editorLoading = document.getElementById('editorLoading');
        this.lineSpan = document.getElementById('editorLine');
        this.colSpan = document.getElementById('editorCol');
        
        this.init();
    }

    /**
     * Initialize Monaco Editor
     */
    async init() {
        if (!this.editorContainer) return;

        try {
            // Show loading state
            this.editorLoading.style.display = 'flex';

            // Wait for Monaco to load
            if (typeof monaco === 'undefined') {
                console.warn('Monaco not available, using fallback editor');
                this.useFallbackEditor();
                return;
            }

            this.monaco = window.monaco;
            this.initializeEditor();
            this.setupEventListeners();
            this.isReady = true;
            
            // Hide loading state
            this.editorLoading.style.display = 'none';

            // Execute any pending operations
            this.pendingOperations.forEach(fn => fn());
            this.pendingOperations = [];

        } catch (error) {
            console.error('Error initializing Monaco Editor:', error);
            this.useFallbackEditor();
        }
    }

    /**
     * Initialize Monaco Editor instance
     */
    initializeEditor() {
        const defaultCode = this.getDefaultCode('javascript');

        this.editor = this.monaco.editor.create(this.editorContainer, {
            value: defaultCode,
            language: 'javascript',
            theme: 'vs-dark',
            fontSize: 14,
            fontFamily: 'Courier New, monospace',
            fontLigatures: false,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            glyphMargin: false,
            lineNumbersMinChars: 4,
            padding: { top: 16, bottom: 16 },
            renderWhitespace: 'none',
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'always',
            highlightActiveIndentGuide: true,
            renderLineHighlight: 'gutter',
            scrollbar: {
                useShadows: true,
                vertical: 'auto',
                horizontal: 'auto',
                verticalSliderSize: 12,
                horizontalSliderSize: 12
            }
        });

        // Create models for each language
        this.createLanguageModels();

        // Store initial model
        this.models['javascript'] = this.editor.getModel();

        // Update line/col on cursor change
        this.editor.onDidChangeCursorPosition((e) => {
            this.lineSpan.textContent = e.position.lineNumber;
            this.colSpan.textContent = e.position.column;
        });

        // Update code stats on change
        this.editor.onDidChangeModelContent(() => {
            this.updateCodeStats();
        });
    }

    /**
     * Create models for all supported languages
     */
    createLanguageModels() {
        const languages = ['javascript', 'python', 'cpp', 'java', 'typescript', 'csharp', 'go', 'rust'];

        languages.forEach(lang => {
            const code = this.getDefaultCode(lang);
            const model = this.monaco.editor.createModel(code, this.getMonacoLanguage(lang));
            this.models[lang] = model;
        });
    }

    /**
     * Map our language keys to Monaco language identifiers
     */
    getMonacoLanguage(lang) {
        const map = {
            'javascript': 'javascript',
            'python': 'python',
            'cpp': 'cpp',
            'java': 'java',
            'typescript': 'typescript',
            'csharp': 'csharp',
            'go': 'go',
            'rust': 'rust'
        };
        return map[lang] || 'plaintext';
    }

    /**
     * Get default code for each language
     */
    getDefaultCode(language) {
        const templates = {
            javascript: `// Two Sum Solution
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return null;
}`,
            python: `# Two Sum Solution
def twoSum(nums, target):
    seen = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return None`,
            cpp: `// Two Sum Solution
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        
        map[nums[i]] = i;
    }
    
    return {};
}`,
            java: `// Two Sum Solution
import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[] {map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return null;
    }
}`
        };

        return templates[language] || templates['javascript'];
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Language selector
        if (this.languageSelect) {
            this.languageSelect.addEventListener('change', (e) => {
                this.switchLanguage(e.target.value);
            });
        }

        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('change', (e) => {
                const newTheme = e.target.checked ? 'vs-dark' : 'vs-light';
                this.monaco.editor.setTheme(newTheme);
            });
        }

        // Word wrap toggle
        if (this.wordWrapToggle) {
            this.wordWrapToggle.addEventListener('change', (e) => {
                this.editor.updateOptions({ wordWrap: e.target.checked ? 'on' : 'off' });
            });
        }

        // Format button
        if (this.formatBtn) {
            this.formatBtn.addEventListener('click', () => this.formatCode());
        }

        // Clear button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearCode());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Format Code: Shift+Alt+F
            if (e.shiftKey && e.altKey && e.key === 'F') {
                e.preventDefault();
                this.formatCode();
            }
        });
    }

    /**
     * Switch language
     */
    switchLanguage(language) {
        if (!this.editor) return;

        // Save current code before switching
        const currentModel = this.editor.getModel();
        if (currentModel) {
            this.models[this.currentLanguage] = currentModel;
        }

        // Switch to new language model
        this.currentLanguage = language;
        const newModel = this.models[language] || 
                         monaco.editor.createModel(this.getDefaultCode(language), language);
        
        this.editor.setModel(newModel);
        this.models[language] = newModel;

        console.log('Switched to:', language);
    }

    /**
     * Get current code
     */
    getCode() {
        if (this.editor) {
            const model = this.editor.getModel();
            return model ? model.getValue() : '';
        }
        return document.getElementById('codeEditorFallback')?.textContent || '';
    }

    /**
     * Set code
     */
    setCode(code) {
        if (this.editor) {
            const model = this.editor.getModel();
            if (model) {
                model.setValue(code);
            }
        }
    }

    /**
     * Format code
     */
    formatCode() {
        if (!this.editor) return;

        this.editor.getAction('editor.action.formatDocument')?.run();
    }

    /**
     * Get code statistics
     */
    getCodeStats() {
        const code = this.getCode();
        return {
            lines: code.split('\n').length,
            characters: code.length,
            words: code.split(/\s+/).length
        };
    }

    /**
     * Clear code
     */
    clearCode() {
        if (this.editor) {
            const model = this.editor.getModel();
            if (model) {
                model.setValue('');
            }
        } else {
            const fallback = document.getElementById('codeEditorFallback');
            if (fallback) {
                fallback.value = '';
            }
        }
    }

    /**
     * Use fallback editor (textarea)
     */
    useFallbackEditor() {
        const fallback = document.getElementById('codeEditorFallback');
        if (fallback) {
            fallback.style.display = 'block';
            fallback.value = this.getDefaultCode('javascript');
        }
    }

    /**
     * Update code statistics in UI
     */
    updateCodeStats() {
        const stats = this.getCodeStats();
        
        // Update global code stats (in top bar)
        const linesEl = document.getElementById('codeLines');
        const charsEl = document.getElementById('codeChars');
        
        if (linesEl) linesEl.textContent = stats.lines;
        if (charsEl) charsEl.textContent = stats.characters;
    }
}

// Initialize on page load
let monacoEditor = null;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('monacoEditorContainer')) {
        monacoEditor = new MonacoEditorManager();
    }
});