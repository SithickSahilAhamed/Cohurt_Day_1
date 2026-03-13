/**
 * WebSocket Manager - Real-time Communication
 * Handles WebSocket connection, authentication, and event publishing/subscribing
 * Supports automatic reconnection with exponential backoff
 */

class WebSocketManager extends EventTarget {
    constructor(url = 'ws://localhost:3000') {
        super();
        
        this.url = url;
        this.socket = null;
        this.isConnected = false;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 8;
        this.baseReconnectDelay = 2000;
        this.messageQueue = [];
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        
        console.log('🔌 WebSocket Manager initialized');
    }

    /**
     * Connect to WebSocket server
     */
    async connect() {
        if (this.isConnecting || this.isConnected) return;
        
        this.isConnecting = true;
        console.log(`🔗 Connecting to ${this.url}...`);

        try {
            this.socket = new WebSocket(this.url);
            
            this.socket.addEventListener('open', () => this.onOpen());
            this.socket.addEventListener('message', (e) => this.onMessage(e));
            this.socket.addEventListener('error', (e) => this.onError(e));
            this.socket.addEventListener('close', () => this.onClose());
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket connection opened
     */
    onOpen() {
        console.log('✅ WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Update UI
        this.updateConnectionStatus(true);
        
        // Authenticate player
        this.authenticate();
        
        // Send queued messages
        this.flushMessageQueue();
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Emit custom event
        this.dispatchConnectionEvent('open');
    }

    /**
     * Handle incoming WebSocket message
     */
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            // Reset heartbeat timeout
            this.resetHeartbeatTimeout();
            
            console.log('📨 Received:', data.type);

            // Route message to handler
            switch (data.type) {
                case 'leaderboard:update':
                    this.dispatchCustomEvent('leaderboard:update', data.payload);
                    break;
                    
                case 'timer:update':
                    this.dispatchCustomEvent('timer:update', data.payload);
                    break;
                    
                case 'submission:result':
                    this.dispatchCustomEvent('submission:result', data.payload);
                    break;
                    
                case 'player:joined':
                    this.dispatchCustomEvent('player:joined', data.payload);
                    break;
                    
                case 'contest:started':
                    this.dispatchCustomEvent('contest:started', data.payload);
                    break;
                    
                case 'contest:ended':
                    this.dispatchCustomEvent('contest:ended', data.payload);
                    break;
                    
                case 'connection:confirmed':
                    console.log('✅ Authentication confirmed');
                    break;
                    
                case 'heartbeat:pong':
                    // Heartbeat response received
                    break;
                    
                default:
                    console.warn('⚠️ Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('❌ Error processing WebSocket message:', error);
        }
    }

    /**
     * Handle WebSocket error
     */
    onError(event) {
        console.error('❌ WebSocket error:', event);
        this.updateConnectionStatus(false);
    }

    /**
     * Handle WebSocket connection closed
     */
    onClose() {
        console.log('🔌 WebSocket disconnected');
        this.isConnected = false;
        this.isConnecting = false;
        this.updateConnectionStatus(false);
        this.stopHeartbeat();
        this.dispatchConnectionEvent('close');
        
        // Attempt to reconnect
        this.scheduleReconnect();
    }

    /**
     * Schedule reconnection with exponential backoff
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.dispatchConnectionEvent('failed');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`⏰ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => this.connect(), delay);
    }

    /**
     * Send message to server (with queuing if not connected)
     */
    send(data) {
        const message = JSON.stringify(data);
        
        if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(message);
            console.log('📤 Sent:', data.type);
        } else {
            console.warn('⚠️ WebSocket not connected, queuing message:', data.type);
            this.messageQueue.push(message);
        }
    }

    /**
     * Flush queued messages
     */
    flushMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.socket.send(message);
            console.log('📤 Sent (from queue)');
        }
    }

    /**
     * Authenticate with server
     */
    authenticate() {
        this.send({
            type: 'auth',
            token: localStorage.getItem('token'),
            userId: localStorage.getItem('userId')
        });
    }

    /**
     * Start heartbeat
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.send({ type: 'heartbeat:ping' });
            
            // Set timeout for heartbeat response
            this.heartbeatTimeout = setTimeout(() => {
                console.warn('⚠️ Heartbeat timeout, reconnecting...');
                this.socket?.close();
            }, 5000);
        }, 30000); // Send heartbeat every 30 seconds
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        clearInterval(this.heartbeatInterval);
        clearTimeout(this.heartbeatTimeout);
    }

    /**
     * Reset heartbeat timeout
     */
    resetHeartbeatTimeout() {
        clearTimeout(this.heartbeatTimeout);
    }

    /**
     * Dispatch custom event
     */
    dispatchCustomEvent(eventType, detail) {
        const event = new CustomEvent(eventType, { detail });
        this.dispatchEvent(event);
    }

    /**
     * Dispatch connection status event
     */
    dispatchConnectionEvent(status) {
        this.dispatchCustomEvent('connection:' + status, { status });
    }

    /**
     * Update connection status in UI
     */
    updateConnectionStatus(isConnected) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('connectionText');

        if (statusDot && statusText) {
            if (isConnected) {
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Connected';
                statusText.style.color = '#4F46E5';
            } else {
                statusDot.className = 'status-dot disconnected';
                statusText.textContent = 'Disconnected';
                statusText.style.color = '#ff6b6b';
            }
        }
    }

    /**
     * Close connection
     */
    close() {
        this.stopHeartbeat();
        if (this.socket) {
            this.socket.close();
        }
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isConnecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts,
            messageQueueLength: this.messageQueue.length
        };
    }
}

// ==================== GLOBAL WEBSOCKET INSTANCE ====================

let wsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // Determine WebSocket URL based on environment
    const wsUrl = window.location.protocol === 'https:' 
        ? `wss://${window.location.host}`
        : `ws://localhost:3000`;
    
    wsManager = new WebSocketManager(wsUrl);
    wsManager.connect();
});
                    </td>
                    <td style="text-align: right; font-size: 0.875rem; color: #888;">
                        ${time}
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Format time difference
     */
    formatTime(timestamp) {
        if (!timestamp) return '-';
        const now = Date.now();
        const diff = Math.floor((now - timestamp) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    /**
     * Get medal emoji for rank
     */
    getMedalEmoji(index) {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return '•';
    }
}

// ==================== GLOBAL WEB SOCKET MANAGER ====================

let ws = null;
let leaderboardHandler = null;

/**
 * Initialize WebSocket on page that needs real-time updates
 */
function initWebSocket() {
    if (!ws) {
        ws = new WebSocketManager('ws://localhost:3000');
        leaderboardHandler = new LeaderboardUpdateHandler();

        // Listen for leaderboard updates
        ws.on('leaderboard:update', (data) => {
            leaderboardHandler.handleUpdate(data);
        });

        // Listen for connection status
        ws.on('connected', () => {
            console.log('WebSocket connected, requesting initial data');
        });

        ws.on('connection:failed', () => {
            console.error('Failed to establish WebSocket connection');
        });
    }

    return ws;
}

/**
 * Auto-initialize WebSocket on pages that have leaderboard
 */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('leaderboardBody') || 
        document.querySelector('.live-leaderboard')) {
        initWebSocket();
    }
});