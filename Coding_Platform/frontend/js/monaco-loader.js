/**
 * Monaco-Loader.js - Monaco Editor Local Loading via AMD Loader
 * Handles local Monaco Editor initialization without CDN
 */

class MonacoLoader {
    constructor() {
        this.monacoPath = '/vendor/monaco-editor';
        this.isLoading = false;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load Monaco Editor from local vendor directory
     */
    loadMonaco() {
        if (this.isLoaded) {
            return Promise.resolve();
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadMonacoInternal();
        return this.loadPromise;
    }

    /**
     * Internal Monaco loading logic
     */
    async _loadMonacoInternal() {
        try {
            this.isLoading = true;

            // Load require.js (AMD loader)
            await this._loadScript(`${this.monacoPath}/min/vs/loader.min.js`);

            // Configure AMD loader
            await this._configureAMDLoader();

            // Load Monaco Editor
            await this._initializeMonaco();

            this.isLoaded = true;
            console.log('Monaco Editor loaded successfully');
        } catch (error) {
            console.error('Failed to load Monaco Editor:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load a script dynamically
     */
    _loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Configure AMD loader paths
     */
    _configureAMDLoader() {
        return new Promise((resolve) => {
            if (typeof require !== 'undefined' && require.config) {
                require.config({
                    paths: {
                        vs: `${this.monacoPath}/min/vs`
                    }
                });
            }
            resolve();
        });
    }

    /**
     * Initialize Monaco Editor
     */
    _initializeMonaco() {
        return new Promise((resolve, reject) => {
            if (typeof require === 'undefined') {
                reject(new Error('AMD loader not available'));
                return;
            }

            require(['vs/editor/editor.main'], () => {
                resolve();
            }, (error) => {
                reject(new Error('Failed to initialize Monaco: ' + error.message));
            });
        });
    }

    /**
     * Get recommended Monaco version
     */
    static getRecommendedVersion() {
        return '0.46.0'; // Latest stable version
    }

    /**
     * Get Monaco download instructions
     */
    static getDownloadInstructions() {
        return `
Monaco Editor Setup Instructions:

1. Download Monaco Editor from: https://github.com/microsoft/monaco-editor/releases
   Version: ${this.getRecommendedVersion()}

2. Extract and place in: frontend/vendor/monaco-editor/

3. Required directory structure:
   frontend/vendor/monaco-editor/
   ├── min/
   │   └── vs/
   │       ├── loader.min.js
   │       ├── editor/
   │       ├── language/
   │       ├── basic-languages/
   │       └── ...

4. Alternative: Use npm to build locally
   npm install monaco-editor
   # Then copy node_modules/monaco-editor/min to frontend/vendor/monaco-editor/

5. Include in HTML:
   <script src="js/monaco-loader.js"></script>
   <script>
       monaccoLoader.loadMonaco().then(() => {
           // Initialize editor
       });
   </script>
        `;
    }
}

// Create global loader instance
const monacoLoader = new MonacoLoader();

/**
 * Helper function to load Monaco before initializing editor
 */
window.initializeMonacoEditor = async function() {
    try {
        await monacoLoader.loadMonaco();
        console.log('Monaco is ready');
        return true;
    } catch (error) {
        console.error('Error loading Monaco:', error);
        console.log(MonacoLoader.getDownloadInstructions());
        return false;
    }
};

/**
 * Auto-load Monaco if this script is included in an HTML page with editor container
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Only auto-load on pages that need Monaco editor
    if (document.getElementById('monacoEditorContainer') || 
        document.getElementById('monacoEditor') ||
        document.querySelector('.monaco-editor-container')) {
        
        console.log('Monaco editor container detected, loading...');
        
        try {
            await monacoLoader.loadMonaco();
        } catch (error) {
            console.warn('Monaco Editor not available, using fallback editor');
            console.log('Setup: ' + MonacoLoader.getDownloadInstructions());
        }
    }
});