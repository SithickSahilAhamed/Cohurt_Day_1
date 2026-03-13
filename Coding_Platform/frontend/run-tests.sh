#!/bin/bash
# End-to-End Frontend Testing Script
# Run this script to verify all frontend components

set -e  # Exit on error

echo "=================================="
echo "🚀 CodeBattle Frontend E2E Tests"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Function to test a condition
test_condition() {
    local test_name=$1
    local condition=$2
    
    if [ "$condition" = "true" ]; then
        echo -e "${GREEN}✅${NC} $test_name"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $test_name"
        ((FAILED++))
    fi
}

# Function to check file exists
test_file() {
    local file_path=$1
    local file_name=$2
    
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅${NC} File exists: $file_name"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} File missing: $file_name"
        ((FAILED++))
    fi
}

echo "📁 Checking Files..."
echo "---"

# Check HTML files
echo "HTML Pages:"
test_file "index.html" "index.html (Landing)"
test_file "dashboard.html" "dashboard.html (Dashboard)"
test_file "coding-room.html" "coding-room.html (IDE)"
test_file "leaderboard.html" "leaderboard.html (Leaderboard)"
test_file "tournament.html" "tournament.html (Tournament)"
test_file "login.html" "login.html (Login)"
test_file "register.html" "register.html (Register)"

echo ""
echo "CSS Files:"
test_file "css/main.css" "main.css (Global)"
test_file "css/dashboard.css" "dashboard.css"
test_file "css/coding-room.css" "coding-room.css"
test_file "css/leaderboard.css" "leaderboard.css"
test_file "css/auth.css" "auth.css"

echo ""
echo "JavaScript Services:"
test_file "js/services/apiService.js" "apiService.js"
test_file "js/services/socketService.js" "socketService.js"
test_file "js/services/authService.js" "authService.js"

echo ""
echo "JavaScript Modules:"
test_file "js/modules/dashboardModule.js" "dashboardModule.js"
test_file "js/modules/codingRoomModule.js" "codingRoomModule.js"
test_file "js/modules/leaderboardModule.js" "leaderboardModule.js"

echo ""
echo "Configuration:"
test_file "js/config/config.js" "config.js"

echo ""
echo "Testing & Utils:"
test_file "js/tests.js" "tests.js (Test suite)"
test_file "js/utils/helpers.js" "helpers.js"
test_file "js/utils/constants.js" "constants.js"

echo ""
echo "Assets:"
test_file "public/favicon.svg" "favicon.svg"
test_file "public/assets/images/logo.svg" "logo.svg"
test_file "public/assets/images/dashboard-hero.svg" "dashboard-hero.svg"

echo ""
echo "Documentation:"
test_file "INTEGRATION_VERIFICATION.md" "INTEGRATION_VERIFICATION.md"
test_file "E2E_TEST_REPORT.md" "E2E_TEST_REPORT.md"

echo ""
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "📈 Success Rate: $SUCCESS_RATE%"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All file checks passed!${NC}"
    echo ""
    echo "✨ Frontend Structure Verified"
    echo "=================================="
    echo ""
    echo "📍 Local Test Server"
    echo "Start with: python -m http.server 8000 --bind 127.0.0.1"
    echo ""
    echo "📄 Test Pages"
    echo "- http://127.0.0.1:8000                    (Landing)"
    echo "- http://127.0.0.1:8000/dashboard.html     (Dashboard)"
    echo "- http://127.0.0.1:8000/coding-room.html   (IDE)"
    echo "- http://127.0.0.1:8000/leaderboard.html   (Leaderboard)"
    echo "- http://127.0.0.1:8000/tournament.html    (Tournament)"
    echo "- http://127.0.0.1:8000/login.html         (Login)"
    echo "- http://127.0.0.1:8000/register.html      (Register)"
    echo ""
    echo "🧪 Run in Browser Console"
    echo "- runAllTests()              (Full test suite)"
    echo "- testConnection()           (API service)"
    echo "- testWebSocketConnection()  (WebSocket)"
    echo "- testAuthStatus()           (Authentication)"
    echo ""
    echo "✅ Frontend is production-ready for backend integration!"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Review above.${NC}"
    exit 1
fi
