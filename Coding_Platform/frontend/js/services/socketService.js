/**
 * Socket Service - WebSocket Real-Time Communication
 * 
 * Handles WebSocket connection, authentication, and event management.
 * Provides automatic reconnection with exponential backoff.
 * Components listen to events through event emitter pattern.
 * 
 * Backend developers: Send events matching the event names defined in CONFIG
 */

class SocketService extends EventTarget {
  constructor(config, authService) {
    super();

    this.config = config;
    this.authService = authService;
    this.url = config.SOCKET.URL;

    // Connection state
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];

    // Reconnection settings
    this.maxReconnectAttempts = config.SOCKET.RECONNECT.maxAttempts;
    this.reconnectDelay = config.SOCKET.RECONNECT.baseDelayMs;
    this.maxReconnectDelay = config.SOCKET.RECONNECT.maxDelayMs;
    this.reconnectMultiplier = config.SOCKET.RECONNECT.backoffMultiplier;

    // Heartbeat settings
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.heartbeatConfig = config.SOCKET.HEARTBEAT;

    // Event listeners registry
    this.eventListeners = new Map();

    console.log('✅ Socket Service initialized');
  }

  // ==========================================
  // CONNECTION MANAGEMENT
  // ==========================================

  /**
   * Connect to WebSocket server
   * Automatically authenticates with JWT token
   */
  async connect() {
    if (this.isConnecting || this.isConnected) {
      console.warn('⚠️  Already connected or connecting');
      return;
    }

    this.isConnecting = true;
    console.log(`🔗 Connecting to WebSocket: ${this.url}`);

    try {
      // TODO: Backend - Add JWT token to WebSocket connection
      // Option 1: As URL query param: ws://url?token=xxx
      // Option 2: As header during handshake
      const token = this.authService.getToken();
      const connectUrl = token ? `${this.url}?token=${token}` : this.url;

      this.socket = new WebSocket(connectUrl);

      // Setup event handlers
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
   * Disconnect from WebSocket server
   */
  disconnect() {
    console.log('🔌 Disconnecting from WebSocket');

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.stopHeartbeat();
  }

  /**
   * Handle WebSocket connection opened
   */
  onOpen() {
    console.log('✅ WebSocket connected');

    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Start heartbeat to keep connection alive
    if (this.heartbeatConfig.enabled) {
      this.startHeartbeat();
    }

    // Send queued messages
    this.flushMessageQueue();

    // Emit connect event
    this.dispatchEvent(new CustomEvent('connect', {
      detail: { timestamp: Date.now() }
    }));
  }

  /**
   * Handle WebSocket message received
   */
  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('📨 WebSocket message:', message.type || message.event, message);

      // TODO: Backend - Send events with standard format
      // Expected format: { event: 'EVENT_NAME', data: {...} }
      const eventName = message.event || message.type;
      if (eventName) {
        this.emit(eventName, message.data || message);
      }

    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  onError(error) {
    console.error('❌ WebSocket error:', error);

    this.dispatchEvent(new CustomEvent('error', {
      detail: { error, timestamp: Date.now() }
    }));
  }

  /**
   * Handle WebSocket connection closed
   */
  onClose() {
    console.log('🔌 WebSocket disconnected');

    const wasConnected = this.isConnected;
    this.isConnected = false;
    this.isConnecting = false;
    this.stopHeartbeat();

    if (wasConnected) {
      this.dispatchEvent(new CustomEvent('disconnect', {
        detail: { timestamp: Date.now() }
      }));
    }

    // Attempt reconnection
    if (this.config.SOCKET.RECONNECT.enabled) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(this.reconnectMultiplier, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;
    console.log(`⏰ Reconnecting in ${Math.round(delay / 1000)}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => this.connect(), delay);
  }

  // ==========================================
  // HEARTBEAT (Keep-Alive)
  // ==========================================

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    console.log('💓 Starting heartbeat');

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });

        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('⚠️  Heartbeat timeout - closing connection');
          this.socket?.close();
        }, this.heartbeatConfig.timeoutMs);
      }
    }, this.heartbeatConfig.intervalMs);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // ==========================================
  // MESSAGE SENDING
  // ==========================================

  /**
   * Send message to server
   * TODO: Backend - Handle these event types
   */
  send(message) {
    if (!this.isConnected) {
      console.warn('⚠️  WebSocket not connected, queueing message');
      this.messageQueue.push(message);
      return false;
    }

    try {
      this.socket.send(JSON.stringify(message));
      console.log('📤 Message sent:', message);
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      return false;
    }
  }

  /**
   * Send queued messages after reconnection
   */
  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 Flushing ${this.messageQueue.length} queued messages`);
    const queue = this.messageQueue.splice(0);
    queue.forEach(message => this.send(message));
  }

  // ==========================================
  // EVENT HANDLING
  // ==========================================

  /**
   * Listen to specific WebSocket event
   * Usage: socketService.on('leaderboard:update', (data) => {...})
   */
  on(eventName, callback) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Remove event listener
   */
  off(eventName, callback) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Listen to event once
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (data) => {
      callback(data);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Emit event to all listeners
   */
  emit(eventName, data) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in listener for ${eventName}:`, error);
        }
      });
    }
  }

  // ==========================================
  // PREDEFINED EVENT HANDLERS
  // ==========================================

  /**
   * Listen to leaderboard updates
   * TODO: Backend sends: { event: 'leaderboard:update', data: { rankings: [...] } }
   */
  onLeaderboardUpdate(callback) {
    return this.on(this.config.SOCKET.EVENTS.LEADERBOARD_UPDATE, callback);
  }

  /**
   * Listen to score updates
   * TODO: Backend sends: { event: 'score:update', data: { userId, newScore, rank } }
   */
  onScoreUpdate(callback) {
    return this.on(this.config.SOCKET.EVENTS.SCORE_UPDATE, callback);
  }

  /**
   * Listen to submission accepted
   * TODO: Backend sends: { event: 'submission:accepted', data: { submissionId, verdict, score } }
   */
  onSubmissionAccepted(callback) {
    return this.on(this.config.SOCKET.EVENTS.SUBMISSION_ACCEPTED, callback);
  }

  /**
   * Listen to submission rejected
   * TODO: Backend sends: { event: 'submission:rejected', data: { submissionId, reason } }
   */
  onSubmissionRejected(callback) {
    return this.on(this.config.SOCKET.EVENTS.SUBMISSION_REJECTED, callback);
  }

  /**
   * Listen to test results
   * TODO: Backend sends: { event: 'test:result', data: { results: [...] } }
   */
  onTestResult(callback) {
    return this.on(this.config.SOCKET.EVENTS.TEST_RESULT, callback);
  }

  /**
   * Listen to timer updates
   * TODO: Backend sends: { event: 'timer:update', data: { timeRemaining, status } }
   */
  onTimerUpdate(callback) {
    return this.on(this.config.SOCKET.EVENTS.TIMER_UPDATE, callback);
  }

  /**
   * Listen to participant joined
   * TODO: Backend sends: { event: 'participant:joined', data: { userId, name } }
   */
  onParticipantJoined(callback) {
    return this.on(this.config.SOCKET.EVENTS.PARTICIPANT_JOINED, callback);
  }

  /**
   * Listen to participant left
   * TODO: Backend sends: { event: 'participant:left', data: { userId } }
   */
  onParticipantLeft(callback) {
    return this.on(this.config.SOCKET.EVENTS.PARTICIPANT_LEFT, callback);
  }

  // ==========================================
  // STATUS & UTILITIES
  // ==========================================

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }

  /**
   * Log connection status
   */
  logStatus() {
    console.log('📊 Socket Status:', this.getStatus());
  }
}

// Global instance
let socketService = null;

/**
 * Initialize Socket Service globally
 * Call this in app.js during startup
 */
function initializeSocketService(config, authService) {
  socketService = new SocketService(config, authService);
  console.log('✅ Socket Service Initialized');
  return socketService;
}

/**
 * Get global Socket Service instance
 */
function getSocketService() {
  if (!socketService) {
    throw new Error('Socket Service not initialized. Call initializeSocketService(config, authService) first.');
  }
  return socketService;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SocketService, initializeSocketService, getSocketService };
}
