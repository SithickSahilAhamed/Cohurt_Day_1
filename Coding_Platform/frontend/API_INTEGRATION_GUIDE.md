# Coding Room - Backend API Integration Guide

## 📋 Overview

This guide specifies all API endpoints and WebSocket events required for the frontend Coding Room to function fully. Backend developers should implement these to integrate with the frontend.

---

## 🔌 REST API Endpoints

### Base URL
```
Development:  http://localhost:3000/api
Production:   https://api.codebattle.com/api
```

### Authentication
All requests (except `/login` and `/register`) require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🔐 Authentication Endpoints

### POST /auth/login
Submit login credentials.

**Request**:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200)**: 
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": 123,
    "username": "programmer_john",
    "email": "user@example.com"
}
```

**Response (401)**: 
```json
{
    "status": "error",
    "message": "Invalid credentials"
}
```

---

### POST /auth/register
Create new user account.

**Request**:
```json
{
    "username": "programmer_john",
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (201)**: 
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": 123,
    "username": "programmer_john"
}
```

**Response (400)**: 
```json
{
    "status": "error",
    "message": "Email already registered"
}
```

---

## 🎯 Tournament Endpoints

### GET /tournaments
List all tournaments.

**Query Parameters**:
- `status`: active, completed, upcoming
- `difficulty`: easy, medium, hard
- `page`: default 1
- `limit`: default 20

**Response (200)**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Weekly Challenge #42",
            "description": "Solve 5 challenging problems",
            "startTime": "2024-01-20T15:00:00Z",
            "endTime": "2024-01-20T17:00:00Z",
            "duration": 7200,
            "participants": 342,
            "status": "active"
        }
    ],
    "page": 1,
    "total": 150,
    "pageSize": 20
}
```

---

### GET /tournaments/:tournamentId
Get specific tournament details.

**Response (200)**:
```json
{
    "id": 1,
    "name": "Weekly Challenge #42",
    "description": "Solve 5 challenging problems",
    "startTime": "2024-01-20T15:00:00Z",
    "endTime": "2024-01-20T17:00:00Z",
    "duration": 7200,
    "problemIds": [1, 2, 3, 4, 5],
    "participants": 342,
    "status": "active",
    "rules": "Submit solutions in any language",
    "prizes": "First place: $500"
}
```

---

### POST /tournaments/:tournamentId/join
Join a tournament.

**Response (200)**:
```json
{
    "message": "Successfully joined tournament",
    "tournamentId": 1,
    "userId": 123
}
```

---

## 📝 Problem Endpoints

### GET /problems/:problemId
Get problem statement and metadata.

**Response (200)**:
```json
{
    "id": 1,
    "title": "Two Sum",
    "difficulty": "easy",
    "description": "Given an array of integers nums and an integer target, return the indices...",
    "input": "An array of integers and a target integer",
    "output": "Two indices of numbers that sum to target",
    "constraints": [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "Only one valid answer exists"
    ],
    "examples": [
        {
            "id": 1,
            "input": "nums = [2,7,11,15], target = 9",
            "output": "[0,1]",
            "explanation": "nums[0] + nums[1] == 9, return [0, 1]"
        },
        {
            "id": 2,
            "input": "nums = [3,2,4], target = 6",
            "output": "[1,2]",
            "explanation": "nums[1] + nums[2] == 6, return [1, 2]"
        }
    ],
    "topics": ["array", "hash-table"],
    "acceptanceRate": 47.2,
    "solvedCount": 3453,
    "timeLimit": 1000,
    "memoryLimit": 256,
    "testCasesCount": 47
}
```

---

### GET /tournaments/:tournamentId/problems
Get all problems for a tournament.

**Response (200)**:
```json
{
    "data": [
        { "id": 1, "title": "Two Sum", "difficulty": "easy", ... },
        { "id": 2, "title": "Add Two Numbers", "difficulty": "medium", ... }
    ]
}
```

---

## 💾 Code Submission Endpoints

### POST /submit
Submit code for evaluation.

**Request**:
```json
{
    "problemId": 1,
    "code": "function twoSum(nums, target) { ... }",
    "language": "javascript",
    "tournamentId": 1,
    "timestamp": 1705779600000
}
```

**Response (200)** - Submission accepted for judging:
```json
{
    "submissionId": "sub_abc123",
    "status": "pending",
    "message": "Submission received, judging started"
}
```

**Response (422)** - Compilation error:
```json
{
    "status": "compilation_error",
    "message": "Syntax error on line 3",
    "submissionId": "sub_abc123"
}
```

**Note**: After submission is judged, server should emit WebSocket event (see WebSocket section).

---

### POST /run
Run code against test cases (no scoring).

**Request**:
```json
{
    "problemId": 1,
    "code": "function twoSum(nums, target) { ... }",
    "language": "javascript"
}
```

**Response (200)**:
```json
{
    "status": "completed",
    "passed": 3,
    "total": 5,
    "testResults": [
        {
            "testCaseId": 1,
            "input": "nums = [2,7,11,15], target = 9",
            "expected": "[0,1]",
            "actual": "[0,1]",
            "passed": true,
            "executionTime": 12,
            "memory": 24
        },
        {
            "testCaseId": 2,
            "input": "nums = [3,2,4], target = 6",
            "expected": "[1,2]",
            "actual": "[1,2]",
            "passed": true,
            "executionTime": 11,
            "memory": 22
        },
        {
            "testCaseId": 3,
            "input": "nums = [2,7,11,15], target = 9",
            "expected": "[0,1]",
            "actual": "[1,0]",
            "passed": false,
            "error": "Wrong answer"
        }
    ]
}
```

---

### GET /submissions/:submissionId
Get submission details and verdict.

**Response (200)**:
```json
{
    "submissionId": "sub_abc123",
    "userId": 123,
    "problemId": 1,
    "language": "javascript",
    "status": "accepted",
    "message": "All test cases passed!",
    "score": 100,
    "executionTime": 24,
    "memory": 48,
    "codeLength": 256,
    "submittedAt": "2024-01-20T15:45:30Z",
    "judgedAt": "2024-01-20T15:45:45Z",
    "testResults": [
        { "testCaseId": 1, "passed": true, "executionTime": 12 },
        { "testCaseId": 2, "passed": true, "executionTime": 11 }
    ]
}
```

---

## 🏆 Leaderboard Endpoints

### GET /tournaments/:tournamentId/leaderboard
Get tournament leaderboard.

**Query Parameters**:
- `page`: default 1
- `limit`: default 50, max 100
- `sortBy`: score (default), time, problems_solved

**Response (200)**:
```json
{
    "data": [
        {
            "rank": 1,
            "userId": 45,
            "username": "codemaster",
            "avatar": "https://...",
            "score": 500,
            "problemsSolved": 5,
            "totalTime": 180,
            "lastSubmissionTime": "2024-01-20T15:45:30Z"
        },
        {
            "rank": 2,
            "userId": 78,
            "username": "algorithm_guru",
            "avatar": "https://...",
            "score": 400,
            "problemsSolved": 4,
            "totalTime": 240,
            "lastSubmissionTime": "2024-01-20T15:30:15Z"
        }
    ],
    "page": 1,
    "total": 342,
    "pageSize": 50
}
```

---

### GET /leaderboard
Get global leaderboard across all tournaments.

**Query Parameters**:
- `page`: default 1
- `limit`: default 50
- `timeRange`: all, month, week, day

**Response (200)**:
```json
{
    "data": [
        {
            "rank": 1,
            "userId": 45,
            "username": "codemaster",
            "rating": 2450,
            "contests": 42,
            "wins": 8,
            "avatar": "https://..."
        }
    ],
    "page": 1,
    "total": 5234
}
```

---

### GET /users/:userId/rank
Get user's current rank.

**Response (200)**:
```json
{
    "userId": 123,
    "globalRank": 245,
    "rating": 1850,
    "problemsSolved": 127,
    "tournaments": 12,
    "wins": 1
}
```

---

## 👤 User Profile Endpoints

### GET /user/profile
Get current user's profile (requires auth).

**Response (200)**:
```json
{
    "userId": 123,
    "username": "programmer_john",
    "email": "user@example.com",
    "avatar": "https://...",
    "bio": "Passionate about competitive programming",
    "organization": "Tech Corp",
    "joinDate": "2023-01-15T00:00:00Z",
    "stats": {
        "submissionsTotal": 234,
        "accepted": 127,
        "wrong": 89,
        "runtimeError": 18,
        "timeoutError": 5,
        "compilationError": 3
    },
    "rating": 1850,
    "rank": 245,
    "badges": ["problem_solver", "speed_demon", "accuracy_master"]
}
```

---

### GET /users/:userId/stats
Get user's statistics.

**Response (200)**:
```json
{
    "userId": 123,
    "problemsSolved": 127,
    "submissionsCount": 234,
    "acceptanceRate": 54.3,
    "averageTime": 1200,
    "bestScore": 500,
    "tournaments": 12,
    "wins": 1,
    "languageBreakdown": {
        "javascript": 45,
        "python": 32,
        "cpp": 28,
        "java": 22
    },
    "topicsMastered": ["array", "string", "hash-table"],
    "achievements": [...]
}
```

---

## 🌐 WebSocket Events

### WebSocket Connection URL
```
Development:  ws://localhost:3000
Production:   wss://api.codebattle.com (path: /ws)
```

### Client Sends to Server

#### Authentication
**Message**:
```json
{
    "type": "auth",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": 123
}
```

**Server Response**:
```json
{
    "type": "connection:confirmed",
    "message": "Authenticated successfully"
}
```

---

#### Heartbeat Ping/Pong
**Client sends every 30 seconds**:
```json
{
    "type": "heartbeat:ping"
}
```

**Server responds**:
```json
{
    "type": "heartbeat:pong"
}
```

---

### Server Sends to Client (Frontend Must Listen)

#### Leaderboard Update
Sent when any player submits or their rank changes.

**Event**:
```json
{
    "type": "leaderboard:update",
    "payload": {
        "userId": 78,
        "username": "algorithm_guru",
        "rank": 2,
        "score": 400,
        "problemsSolved": 4,
        "lastSubmissionTime": "2024-01-20T15:45:30Z"
    }
}
```

**Frontend Handler**:
```javascript
wsManager.addEventListener('leaderboard:update', (event) => {
    const {userId, rank, score} = event.detail;
    // Update leaderboard row with animation
    document.querySelector(`[data-user-id="${userId}"]`).classList.add('highlight');
});
```

---

#### Timer Update
Sent every ~5 seconds or on minute change.

**Event**:
```json
{
    "type": "timer:update",
    "payload": {
        "timeRemaining": 3600,
        "totalTime": 7200,
        "percentRemaining": 50
    }
}
```

**Frontend Handler**:
```javascript
wsManager.addEventListener('timer:update', (event) => {
    const {timeRemaining} = event.detail;
    // Update timer display
    const hours = Math.floor(timeRemaining / 3600);
    // ... format and update UI
});
```

---

#### Submission Result
Sent when code is judged (after running POST /submit).

**Event - Accepted**:
```json
{
    "type": "submission:result",
    "payload": {
        "userId": 123,
        "submissionId": "sub_abc123",
        "problemId": 1,
        "status": "accepted",
        "score": 100,
        "executionTime": 24,
        "memory": 48,
        "message": "All test cases passed!",
        "timestamp": "2024-01-20T15:45:45Z"
    }
}
```

**Event - Wrong Answer**:
```json
{
    "type": "submission:result",
    "payload": {
        "userId": 123,
        "submissionId": "sub_abc123",
        "problemId": 1,
        "status": "wrong_answer",
        "passedTests": 3,
        "totalTests": 5,
        "message": "Failed on test case 4",
        "timestamp": "2024-01-20T15:45:45Z"
    }
}
```

**Frontend Handler**:
```javascript
wsManager.addEventListener('submission:result', (event) => {
    const {status, message, score} = event.detail;
    // Show result notification
    // Update leaderboard
    // Refresh user rankings
});
```

---

#### Player Joined
Sent when a new participant joins the tournament.

**Event**:
```json
{
    "type": "player:joined",
    "payload": {
        "userId": 456,
        "username": "newbie_coder",
        "joinTime": "2024-01-20T15:50:00Z",
        "totalParticipants": 343
    }
}
```

---

#### Contest Started
Sent when tournament begins.

**Event**:
```json
{
    "type": "contest:started",
    "payload": {
        "contestId": 1,
        "startTime": "2024-01-20T15:00:00Z",
        "duration": 7200,
        "problems": 5
    }
}
```

---

#### Contest Ended
Sent when tournament ends.

**Event**:
```json
{
    "type": "contest:ended",
    "payload": {
        "contestId": 1,
        "endTime": "2024-01-20T17:00:00Z",
        "finalLeaderboard": [
            { "rank": 1, "userId": 45, "username": "codemaster", "score": 500 },
            { "rank": 2, "userId": 78, "username": "algorithm_guru", "score": 400 }
        ],
        "announcement": "Thank you for participating!"
    }
}
```

---

## 🔄 Data Flow Examples

### Example 1: User Submits Code

1. **User clicks Submit in Frontend**
   ```javascript
   // codingRoom.js: handleSubmitCode()
   const code = monacoEditor.getCode();
   const response = await api.submitCode(problemId, code, language);
   // Response: { submissionId: 'sub_123' } (pending)
   ```

2. **Backend Evaluates** (asynchronous, typically 2-10 seconds)
   - Code compiled
   - Test cases executed
   - Result computed (accepted/wrong/error)
   - Score calculated

3. **Backend Broadcasts WebSocket Event**
   ```json
   {
       "type": "submission:result",
       "payload": {
           "userId": 123,
           "status": "accepted",
           "score": 100
       }
   }
   ```

4. **Frontend Receives Event**
   ```javascript
   // codingRoom.js: listener
   wsManager.addEventListener('submission:result', (event) => {
       console.log('Submission status:', event.detail.status);
       // Update leaderboard
       this.loadLeaderboardData();
   });
   ```

5. **Leaderboard Updates Automatically**
   - User's ranking changes
   - WebSocket broadcasts `leaderboard:update`
   - All clients see real-time rank changes

---

### Example 2: Leaderboard Vote in Real-time

1. **User A submits solution**
   - Backend processes → accepted
   - User A moves from rank 5 to rank 4

2. **Backend Broadcasts to All Clients**
   ```json
   {
       "type": "leaderboard:update",
       "payload": {
           "userId": 123,
           "rank": 4,
           "score": 400
       }
   }
   ```

3. **All WebSocket Clients Receive**
   - User A's leaderboard row highlights with pulse animation
   - Rank number updates from 5 to 4
   - Score updates to 400
   - Animation removes after 2 seconds

4. **Backend Also Broadcasts to Other Affected Users**
   - User B (previously rank 4) now rank 5
   - `leaderboard:update` sent for User B
   - All clients update accordingly

---

## ⚡ Implementation Priority

### Phase 1 (Critical - Day 1)
- [ ] `/auth/login` & `/auth/register`
- [ ] `/problems/:problemId` GET
- [ ] `/submit` POST (with async judging)
- [ ] WebSocket: `submission:result` event

### Phase 2 (High - Day 2-3)
- [ ] `/tournaments/:id/leaderboard` GET
- [ ] `/tournaments/:id` GET
- [ ] WebSocket: `leaderboard:update` event
- [ ] WebSocket: `timer:update` event
- [ ] WebSocket: `player:joined` event

### Phase 3 (Medium - Week 2)
- [ ] `/run` POST (test execution)
- [ ] `/submissions/:id` GET
- [ ] `/user/profile` GET
- [ ] `/users/:id/stats` GET
- [ ] WebSocket authentication proper

### Phase 4 (Nice-to-have)
- [ ] Global leaderboard
- [ ] User badges/achievements
- [ ] Tournament browser UI
- [ ] Analytics endpoints

---

## 🧪 Testing API

### Use this during development:

**Test with cURL**:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Get problem
curl -X GET http://localhost:3000/api/problems/1 \
  -H "Authorization: Bearer <TOKEN>"

# Submit code
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"problemId":1,"code":"...","language":"javascript"}'
```

**Test WebSocket**:
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
    ws.send(JSON.stringify({type: 'auth', token: '...'}));
};
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 📚 Response Format Convention

**Success Response**:
```json
{
    "status": "success",
    "data": { ... },
    "message": "Operation successful"
}
```

**Error Response**:
```json
{
    "status": "error",
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": { ... }
}
```

---

## ⏱️ Timeouts & Performance

- API Timeouts: 10 seconds (configurable in api.js)
- WebSocket Heartbeat: 30 seconds
- WebSocket Timeout: 5 seconds
- Leaderboard refresh: 5-10 seconds
- Timer broadcast: Every ~5 seconds
- Submission judging: 2-10 seconds (depends on code)

---

## 🔒 Security Requirements

- Validate JWT token on every API request
- Authenticate WebSocket connections
- Rate limit API endpoints (10 req/min default)
- Sanitize code before execution
- Validate all input parameters server-side
- Use HTTPS/WSS in production
- Implement CSRF protection

---

## 📞 Integration Support

For questions about API integration:
1. Check CODING_ROOM_COMPLETE.md for frontend details
2. Review this file for backend requirements
3. Test WebSocket using browser DevTools
4. Enable verbose logging in codingRoom.js

---

**Last Updated**: 2024
**Status**: Ready for Backend Integration ✅
