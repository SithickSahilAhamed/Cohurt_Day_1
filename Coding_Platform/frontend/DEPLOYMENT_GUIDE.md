# Coding Room - Quick Start & Deployment Guide

## ⚡ 5-Minute Quick Start

### 1. Local Testing (No Backend Required)
```bash
# Navigate to project
cd c:\Users\sabee\Desktop\Cohurt\Coding_Platform\frontend

# Serve files locally
python -m http.server 8000

# Open in browser
# http://localhost:8000/coding-room.html
```

### 2. Test Features
| Feature | How to Test |
|---------|-----------|
| **Editor** | Type code, switch languages (dropdown works) |
| **Timer** | Watch countdown in top bar |
| **Leaderboard** | Scroll the player list |
| **Format Code** | Press Shift+Alt+F |
| **Run Code** | Press Ctrl+Enter (shows mock results) |
| **Submit** | Press Ctrl+Shift+Enter (plays animation) |
| **Status** | Watch connection indicator (red = disconnected) |

---

## 🔧 Configuration Guide

### Step 1: Update WebSocket URL
**File**: `js/websocket.js` (Line 303)
```javascript
// Change this:
const wsUrl = window.location.protocol === 'https:' 
    ? `wss://${window.location.host}`
    : `ws://localhost:3000`;

// To your production server:
const wsUrl = 'wss://api.codebattle.com/ws';
```

### Step 2: Update API Endpoint
**File**: `js/api.js` (Line 4)
```javascript
// Change this:
const API_BASE_URL = 'http://localhost:3000/api';

// To your production API:
const API_BASE_URL = 'https://api.codebattle.com/api';
```

### Step 3: Configure Contest Duration
**File**: `js/codingRoom.js` (Line 11)
```javascript
// Default: 2 hours
this.timeRemaining = 120 * 60;

// Change to:
this.timeRemaining = 60 * 60;  // 1 hour
// or
this.timeRemaining = 45 * 60;  // 45 minutes
```

---

## 📋 Implementation Checklist

### Frontend Ready ✅
- [x] HTML template (3-column layout)
- [x] CSS styling (responsive design)
- [x] Monaco Editor integration
- [x] WebSocket communication
- [x] Keyboard shortcuts
- [x] Error handling
- [x] Loading states
- [x] Real-time leaderboard

### Backend Required (Implement These)
- [ ] WebSocket server setup
- [ ] Authentication endpoints
- [ ] Problem API endpoints
- [ ] Code execution service
- [ ] Leaderboard computation
- [ ] Timer synchronization
- [ ] Submission judging system

### Backend Endpoints Needed

```javascript
// 1. Authentication
POST /api/auth/login
  Response: { token, userId, username }

// 2. Get Problem
GET /api/problems/:problemId
  Response: {
    id, title, difficulty, description,
    input, output, constraints, examples,
    timeLimit, memoryLimit
  }

// 3. Submit Code
POST /api/submit
  Body: { problemId, code, language }
  Response: 
    { 
      status: 'accepted|wrong_answer|runtime_error|time_limit_exceeded',
      message: 'string',
      score: number,
      submissionId: 'string'
    }

// 4. Run Tests
POST /api/run
  Body: { problemId, code, language }
  Response:
    {
      passed: number,
      total: number,
      testResults: [
        { input, expected, actual, passed }
      ]
    }

// 5. Get Leaderboard
GET /api/tournaments/:tournamentId/leaderboard
  Response:
    {
      data: [
        { rank, userId, username, score, timeSpent, status }
      ]
    }

// 6. WebSocket Events (Server → Client)
{
  type: 'leaderboard:update',
  payload: { userId, username, score, rank }
}
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Files
```bash
# Minify CSS (optional)
minify css/coding-room.css > css/coding-room.min.css

# Minify JavaScript (optional)
minify js/codingRoom.js > js/codingRoom.min.js
# Repeat for other JS files

# Update HTML to use minified files (if minifying)
```

### Step 2: HTTPS Configuration
```bash
# Get SSL certificate (example with Let's Encrypt)
certbot certonly --standalone -d codebattle.com

# Configure web server (nginx example)
server {
    listen 443 ssl http2;
    server_name codebattle.com;
    
    ssl_certificate /etc/letsencrypt/live/codebattle.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codebattle.com/privkey.pem;
    
    root /var/www/codebattle/frontend;
    index coding-room.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Step 3: Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy frontend files
COPY frontend /app

# Install simple web server
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start server
CMD ["serve", "-s", ".", "-l", "3000"]
```

```bash
# Build and run
docker build -t codebattle:latest .
docker run -d -p 3000:3000 codebattle:latest
```

### Step 4: Verify Deployment
```bash
# Test connectivity
curl https://codebattle.com/coding-room.html

# Test WebSocket
# Open browser DevTools:
# In console, check for connection messages
wsManager.getStatus()

# Check API connectivity  
api.healthCheck().then(ok => console.log(ok ? 'API OK' : 'API Failed'))
```

---

## 🔍 Quality Assurance

### Pre-Deployment Tests

```javascript
// In browser console:

// 1. Check editor initialization
monacoEditor ? 'Editor OK' : 'Editor Failed'

// 2. Check WebSocket status
wsManager.getStatus()
// Output: {isConnected: true, reconnectAttempts: 0, ...}

// 3. Check API client
api.healthCheck().then(console.log)

// 4. Test keyboard shortcuts
// Press Ctrl+Enter → Should trigger Run Code
// Press Shift+Alt+F → Should format code

// 5. Verify CSS loaded
window.getComputedStyle(document.body).backgroundColor

// 6. Test data binding
document.getElementById('codeLines').textContent // Should show number

// 7. Performance check
performance.now()  // Check page load time

// 8. Memory usage
console.memory  // Chrome DevTools shows memory
```

### Load Testing
```bash
# Using apache benchmark
ab -n 1000 -c 100 https://codebattle.com/coding-room.html

# Using wrk (WebSocket testing)
wrk -t4 -c100 -d30s wss://codebattle.com/ws
```

---

## 🐛 Troubleshooting Deployment

| Issue | Cause | Solution |
|-------|-------|----------|
| Blank page | HTML not loading | Check MIME types, verify path |
| "Cannot find editor" | Monaco CDN failed | Check CDN availability, fallback works |
| WebSocket stuck at "Connecting" | Server not running | Start WebSocket server, check URL |
| Code not executing | API endpoint wrong | Update API_BASE_URL in api.js |
| Leaderboard not updating | WebSocket event not received | Check server is broadcasting events |
| Timer not syncing | Local timer only | Implement server-side timer sync |
| Buttons not responding | CSS not loaded | Check CSS file path, clear cache |

---

## 📊 Monitoring & Analytics

### Key Metrics to Monitor
```javascript
// Connection success rate
wsManager.reconnectAttempts / wsManager.maxReconnectAttempts

// Code submission rate
// Track: submissions/minute

// Editor usage
// Track: language distribution, format requests

// Performance
// Track: page load time, API response time, WebSocket latency

// User retention
// Track: session duration, submissionss per session
```

### Error Logging Setup
```javascript
// Example: Send errors to monitoring service
window.addEventListener('error', (event) => {
    fetch('https://logs.codebattle.com/error', {
        method: 'POST',
        body: JSON.stringify({
            message: event.message,
            stack: event.error.stack,
            timestamp: new Date(),
            url: window.location.href
        })
    });
});
```

---

## 🎓 Developer Documentation

### How the System Works

1. **Page Load**:
   - HTML parsed, CSS loaded
   - Monaco Editor initialized (or fallback to textarea)
   - WebSocket connection established
   - Initial problem & leaderboard loaded

2. **User Types Code**:
   - Monaco updates model in real-time
   - Code stats calculated (lines, chars)
   - Updated in UI

3. **User Submits**:
   - Code extracted from editor
   - Sent to backend via API
   - Backend judges against test cases
   - Result broadcast via WebSocket
   - Leaderboard refreshed
   - Player rank updated with animation

4. **Real-time Updates**:
   - Other players' submissions cause leaderboard updates
   - Updates arrive via WebSocket
   - Frontend animates rank change
   - Player sees their relative position instantly

### Key JavaScript Patterns Used

```javascript
// EventTarget for custom events (WebSocket)
class WebSocketManager extends EventTarget { ... }
wsManager.addEventListener('event:name', handler)
wsManager.dispatchEvent(new CustomEvent(...))

// Class-based architecture
class MonacoEditorManager { ... }
class CodingRoomManager { ... }

// Singleton pattern
let monacoEditor = null;  // Global instance
let wsManager = null;     // Global instance
let api = new APIClient(); // Global instance

// Event delegation
document.addEventListener('DOMContentLoaded', () => { ... })

// Fetch API with timeout
const controller = new AbortController();
fetch(url, { signal: controller.signal })

// LocalStorage for persistence
localStorage.getItem('token')
localStorage.setItem('userId', id)
```

---

## 📞 Deployment Support

### Support Resources
- Monaco Editor Docs: https://microsoft.github.io/monaco-editor/
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- CSS Grid Guide: https://css-tricks.com/snippets/css/complete-guide-grid/

### Common Questions

**Q: Can I use a different code editor?**
A: Yes, replace MonacoEditorManager with Ace, CodeMirror, etc.

**Q: Does it work without backend?**
A: Partially - all UI works, but submissions won't be judged

**Q: How many concurrent users?**
A: Depends on WebSocket server capacity (typically 10k+ with load balancing)

**Q: Can I customize colors/theme?**
A: Yes, update CSS variables in `main.css`

**Q: Is authentication required?**
A: Frontend includes JWT headers, backend must validate

---

## ✅ Final Checklist Before Going Live

- [ ] All configuration variables updated (WebSocket URL, API endpoint)
- [ ] HTTPS enabled (SSL certificate installed)
- [ ] Backend endpoints implemented and tested
- [ ] WebSocket server deployed and running
- [ ] Error logging configured
- [ ] Database backups automated
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Security audit completed
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Performance optimized (< 3s page load)
- [ ] Documentation updated for support team
- [ ] Disaster recovery plan in place

---

## 🎉 You're Ready to Deploy!

The Coding Room is **production-ready** with all frontend features complete. Focus on:

1. **Backend Implementation** (most critical)
2. **WebSocket Server Setup** (real-time connectivity)
3. **Problem Database** (add your problem set)
4. **Code Judging System** (evaluation engine)
5. **Monitoring & Analytics** (post-deploy insights)

Good luck with your deployment! 🚀

---

**Last Updated**: 2024
**Status**: Ready for Production ✅
