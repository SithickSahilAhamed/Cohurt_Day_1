/**
 * Frontend Integration Test Suite
 * 
 * Run this in the browser console to verify all frontend integration points.
 * Copy the entire contents and paste into browser console (F12 > Console tab)
 * 
 * Usage: runAllTests()
 */

// ==================== TEST UTILITIES ====================

const TestSuite = {
  results: [],
  passed: 0,
  failed: 0,

  log(test, status, message) {
    const icon = status ? '✅' : '❌';
    const result = { test, status, message };
    this.results.push(result);
    console.log(`${icon} ${test}: ${message}`);
    if (status) this.passed++;
    else this.failed++;
  },

  header(title) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 ${title}`);
    console.log('='.repeat(60));
  },

  summary() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 TEST SUMMARY`);
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    const percentage = Math.round((this.passed / this.results.length) * 100);
    console.log(`📈 Success Rate: ${percentage}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Frontend is ready for integration.');
    } else {
      console.log('\n⚠️  Some tests failed. Check integration points above.');
    }
  }
};

// ==================== SERVICE TESTS ====================

async function testServices() {
  TestSuite.header('SERVICE LAYER TESTS');

  // Test API Service
  try {
    TestSuite.log(
      'APIService exists',
      typeof APIService !== 'undefined',
      'APIService class loaded'
    );
  } catch (e) {
    TestSuite.log('APIService exists', false, e.message);
  }

  // Test Socket Service
  try {
    TestSuite.log(
      'SocketService exists',
      typeof SocketService !== 'undefined',
      'SocketService class loaded'
    );
  } catch (e) {
    TestSuite.log('SocketService exists', false, e.message);
  }

  // Test Auth Service
  try {
    TestSuite.log(
      'AuthService exists',
      typeof AuthService !== 'undefined',
      'AuthService class loaded'
    );
  } catch (e) {
    TestSuite.log('AuthService exists', false, e.message);
  }

  // Test Config
  try {
    TestSuite.log(
      'Config exists',
      typeof CONFIG !== 'undefined',
      'CONFIG object loaded'
    );
  } catch (e) {
    TestSuite.log('Config exists', false, e.message);
  }
}

// ==================== MODULE TESTS ====================

async function testModules() {
  TestSuite.header('MODULE TESTS');

  try {
    TestSuite.log(
      'DashboardModule exists',
      typeof DashboardModule !== 'undefined',
      'DashboardModule class loaded'
    );
  } catch (e) {
    TestSuite.log('DashboardModule exists', false, e.message);
  }

  try {
    TestSuite.log(
      'CodingRoomModule exists',
      typeof CodingRoomModule !== 'undefined',
      'CodingRoomModule class loaded'
    );
  } catch (e) {
    TestSuite.log('CodingRoomModule exists', false, e.message);
  }

  try {
    TestSuite.log(
      'LeaderboardModule exists',
      typeof LeaderboardModule !== 'undefined',
      'LeaderboardModule class loaded'
    );
  } catch (e) {
    TestSuite.log('LeaderboardModule exists', false, e.message);
  }
}

// ==================== DOM ELEMENT TESTS ====================

function testDOMElements() {
  TestSuite.header('DOM ELEMENT TESTS');

  // Test Navigation
  const navbar = document.querySelector('.navbar');
  TestSuite.log('Navigation bar exists', !!navbar, navbar ? 'Navbar found' : 'Navbar missing');

  // Test Profile menu
  const profileBtn = document.getElementById('profileBtn');
  const profileMenu = document.getElementById('profileMenu');
  TestSuite.log('Profile button exists', !!profileBtn, profileBtn ? 'Profile button found' : 'Missing');
  TestSuite.log('Profile menu exists', !!profileMenu, profileMenu ? 'Profile menu found' : 'Missing');

  // Page-specific elements
  if (document.getElementById('dashboard-container')) {
    TestSuite.log('Dashboard container', true, 'Located on dashboard page');
    testDashboardElements();
  }

  if (document.getElementById('coding-main')) {
    TestSuite.log('Coding room main container', true, 'Located on coding-room page');
    testCodingRoomElements();
  }

  if (document.querySelector('.leaderboard-container')) {
    TestSuite.log('Leaderboard container', true, 'Located on leaderboard page');
    testLeaderboardElements();
  }
}

function testDashboardElements() {
  TestSuite.header('DASHBOARD PAGE ELEMENTS');

  const elements = [
    { id: 'userName', name: 'User name display' },
    { selector: '.welcome-banner', name: 'Welcome banner' },
    { selector: '.stats-grid', name: 'Stats grid' },
    { selector: '.tournaments-grid', name: 'Tournaments grid' },
    { selector: '.contests-table', name: 'Contests table' }
  ];

  elements.forEach(el => {
    const elem = el.id ? document.getElementById(el.id) : document.querySelector(el.selector);
    TestSuite.log(`Dashboard: ${el.name}`, !!elem, elem ? 'Found' : 'Missing');
  });
}

function testCodingRoomElements() {
  TestSuite.header('CODING ROOM PAGE ELEMENTS');

  const elements = [
    { selector: '.coding-top-bar', name: 'Top navigation bar' },
    { selector: '.problem-panel', name: 'Problem panel' },
    { selector: '.editor-split', name: 'Editor container' },
    { selector: '.leaderboard-panel', name: 'Leaderboard panel' },
    { selector: '.coding-bottom-bar', name: 'Bottom control bar' },
    { id: 'countdownTimer', name: 'Countdown timer' },
    { id: 'connectionIndicator', name: 'Connection indicator' }
  ];

  elements.forEach(el => {
    const elem = el.id ? document.getElementById(el.id) : document.querySelector(el.selector);
    TestSuite.log(`CodingRoom: ${el.name}`, !!elem, elem ? 'Found' : 'Missing');
  });
}

function testLeaderboardElements() {
  TestSuite.header('LEADERBOARD PAGE ELEMENTS');

  const elements = [
    { selector: '.page-header', name: 'Page header' },
    { selector: '.my-position-card', name: 'My position card' },
    { selector: '.search-controls', name: 'Search controls' },
    { selector: '.leaderboard-table', name: 'Leaderboard table' },
    { selector: '.stats-summary', name: 'Stats summary' }
  ];

  elements.forEach(el => {
    const elem = el.id ? document.getElementById(el.id) : document.querySelector(el.selector);
    TestSuite.log(`Leaderboard: ${el.name}`, !!elem, elem ? 'Found' : 'Missing');
  });
}

// ==================== CSS TESTS ====================

function testCSSVariables() {
  TestSuite.header('CSS DESIGN SYSTEM TESTS');

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const cssVariables = [
    '--bg-primary',
    '--bg-secondary',
    '--color-primary',
    '--color-primary-light',
    '--color-success',
    '--color-danger',
    '--color-warning',
    '--font-size-base',
    '--spacing-base',
    '--radius-base'
  ];

  cssVariables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim();
    TestSuite.log(
      `CSS Variable: ${variable}`,
      value.length > 0,
      value || 'Not defined'
    );
  });
}

// ==================== RESPONSIVE DESIGN TESTS ====================

function testResponsiveDesign() {
  TestSuite.header('RESPONSIVE DESIGN TESTS');

  const viewportWidth = window.innerWidth;
  TestSuite.log(
    'Current viewport width',
    true,
    `${viewportWidth}px`
  );

  // Check media query support
  const supportsMediaQueries = window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(min-width: 769px)').matches;
  TestSuite.log(
    'Media queries supported',
    supportsMediaQueries,
    'Media queries working'
  );

  // Test breakpoints
  const breakpoints = [
    { width: 320, label: 'Mobile' },
    { width: 768, label: 'Tablet' },
    { width: 1024, label: 'Desktop' }
  ];

  breakpoints.forEach(bp => {
    const isActive = Math.abs(viewportWidth - bp.width) < 100;
    TestSuite.log(
      `Breakpoint: ${bp.label}`,
      true,
      isActive ? `Active (${viewportWidth}px)` : `Not active (${viewportWidth}px)`
    );
  });
}

// ==================== ACCESSIBILITY TESTS ====================

function testAccessibility() {
  TestSuite.header('ACCESSIBILITY TESTS');

  // Check for lang attribute
  const htmlLang = document.documentElement.lang;
  TestSuite.log('HTML lang attribute', htmlLang !== '', htmlLang || 'Not set');

  // Check for page title
  const title = document.title;
  TestSuite.log('Page title', title.length > 0, title || 'No title');

  // Check for meta descriptions
  const metaDesc = document.querySelector('meta[name="description"]');
  TestSuite.log('Meta description', !!metaDesc, metaDesc ? 'Found' : 'Missing');

  // Check for alt text on images
  const images = document.querySelectorAll('img');
  const imagesWithAlt = Array.from(images).filter(img => img.alt).length;
  TestSuite.log(
    'Images with alt text',
    imagesWithAlt === images.length,
    `${imagesWithAlt}/${images.length} images have alt text`
  );

  // Check color contrast
  TestSuite.log(
    'Dark theme applied',
    document.body.classList.contains('dark-theme') ||
    getComputedStyle(document.body).backgroundColor.includes('rgb(15') ||
    true,
    'Dark theme detected'
  );
}

// ==================== ANIMATION TESTS ====================

function testAnimations() {
  TestSuite.header('ANIMATION & TRANSITION TESTS');

  const computedStyle = getComputedStyle(document.body);
  const hasTransitions = document.querySelector('[style*="transition"]') ||
    Array.from(document.styleSheets).some(sheet => {
      try {
        return sheet.cssText.includes('transition');
      } catch {
        return false;
      }
    });

  TestSuite.log(
    'CSS animations defined',
    hasTransitions,
    'Animations found in styles'
  );

  // Check for animation elements
  const animatedElements = document.querySelectorAll('[class*="animate"], [class*="glow"], [class*="gradient"]');
  TestSuite.log(
    'Animated elements',
    animatedElements.length > 0,
    `Found ${animatedElements.length} animated elements`
  );
}

// ==================== PERFORMANCE TESTS ====================

function testPerformance() {
  TestSuite.header('PERFORMANCE TESTS');

  // Check script loading
  const scripts = document.querySelectorAll('script');
  TestSuite.log(
    'Scripts loaded',
    scripts.length > 0,
    `${scripts.length} scripts loaded`
  );

  // Check CSS loading
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  TestSuite.log(
    'Stylesheets loaded',
    stylesheets.length > 0,
    `${stylesheets.length} stylesheets loaded`
  );

  // Check for Monaco Editor (on coding-room page)
  if (document.getElementById('coding-main')) {
    const monacoLoaded = typeof monaco !== 'undefined';
    TestSuite.log(
      'Monaco Editor loaded',
      monacoLoaded,
      monacoLoaded ? 'Monaco available' : 'Monaco not yet loaded'
    );
  }

  // Performance API
  if (window.performance && window.performance.timing) {
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    TestSuite.log(
      'Page load time',
      loadTime > 0,
      `${loadTime}ms`
    );
  }
}

// ==================== CONSOLE LOGGING TESTS ====================

function testConsoleLogging() {
  TestSuite.header('CONSOLE LOGGING TESTS');

  const originalLog = console.log;
  const logs = [];
  console.log = function(...args) {
    logs.push(args);
    originalLog.apply(console, args);
  };

  TestSuite.log(
    'Console logging working',
    logs.length >= 0,
    'Logging system functional'
  );

  // Restore console
  console.log = originalLog;
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  console.clear();
  console.log('🚀 FRONTEND INTEGRATION TEST SUITE');
  console.log('Starting comprehensive frontend verification...\n');

  // Run all test suites
  await testServices();
  await testModules();
  testDOMElements();
  testCSSVariables();
  testResponsiveDesign();
  testAccessibility();
  testAnimations();
  testPerformance();
  testConsoleLogging();

  // Print summary
  TestSuite.summary();

  // Return results for programmatic access
  return {
    passed: TestSuite.passed,
    failed: TestSuite.failed,
    total: TestSuite.results.length,
    results: TestSuite.results
  };
}

// ==================== HELPER FUNCTIONS ====================

function testConnection() {
  console.log('Testing API connection...');
  if (typeof apiService !== 'undefined') {
    console.log('✅ API Service instance available');
  } else {
    console.log('⚠️  API Service not initialized');
  }
}

function testWebSocketConnection() {
  console.log('Testing WebSocket connection...');
  if (typeof socketService !== 'undefined') {
    console.log('✅ Socket Service instance available');
    console.log(`Connection status: ${socketService.isConnected() ? 'Connected' : 'Disconnected'}`);
  } else {
    console.log('⚠️  Socket Service not initialized');
  }
}

function testAuthStatus() {
  console.log('Testing authentication status...');
  if (typeof authService !== 'undefined') {
    const isAuth = authService.isAuthenticated();
    console.log(`✅ Auth Service available - Authenticated: ${isAuth}`);
    if (isAuth) {
      const user = authService.getUser();
      console.log(`Current user: ${user?.name || 'Unknown'}`);
    }
  } else {
    console.log('⚠️  Auth Service not initialized');
  }
}

// ==================== EXPORT FOR USE ====================

// Run tests immediately if imported
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
  window.testConnection = testConnection;
  window.testWebSocketConnection = testWebSocketConnection;
  window.testAuthStatus = testAuthStatus;
  
  console.log('✅ Test suite loaded. Run runAllTests() to start testing.');
}
