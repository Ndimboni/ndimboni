const API_BASE_URL = "https://ndimboniapi.ini.rw";
const CHECK_API_URL = `${API_BASE_URL}/api/scam-check/check`;
const LOGIN_API_URL = `${API_BASE_URL}/auth/login`;

// DOM Elements
const loginView = document.getElementById('login-view');
const mainView = document.getElementById('main-view');
const resultsView = document.getElementById('results-view');
const loadingOverlay = document.getElementById('loading-overlay');

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const checkPageBtn = document.getElementById('check-page-btn');
const manualInput = document.getElementById('manual-input');
const checkManualBtn = document.getElementById('check-manual-btn');
const mainError = document.getElementById('main-error');

const backBtn = document.getElementById('back-btn');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const riskScoreSpan = document.getElementById('risk-score');
const analysisText = document.getElementById('analysis-text');
const reasonsContainer = document.getElementById('reasons-container');
const reasonsList = document.getElementById('reasons-list');

// State
let authToken = null;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get(['access_token', 'user_name']);
    if (data.access_token) {
        authToken = data.access_token;
        if (data.user_name) {
            userNameSpan.textContent = data.user_name;
        }
        logoutBtn.textContent = 'Logout';
    } else {
        userNameSpan.textContent = 'Guest';
        logoutBtn.textContent = 'Login';
    }
    showView(mainView);
});

// Navigation
function showView(view) {
    loginView.classList.add('hidden');
    mainView.classList.add('hidden');
    resultsView.classList.add('hidden');
    view.classList.remove('hidden');
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Auth
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    showLoading(true);
    loginError.textContent = '';

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
            authToken = data.access_token;
            const userName = data.user ? data.user.name : 'User';
            
            await chrome.storage.local.set({
                access_token: authToken,
                user_name: userName,
                user_role: data.user ? data.user.role : 'user'
            });

            userNameSpan.textContent = userName;
            logoutBtn.textContent = 'Logout';
            showView(mainView);
            // Clear form
            emailInput.value = '';
            passwordInput.value = '';
        } else {
            loginError.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        loginError.textContent = 'Network error. Please try again.';
        console.error('Login error:', error);
    } finally {
        showLoading(false);
    }
});

logoutBtn.addEventListener('click', async () => {
    if (authToken) {
        // Logout logic
        await chrome.storage.local.clear();
        authToken = null;
        userNameSpan.textContent = 'Guest';
        logoutBtn.textContent = 'Login';
        // Stay on main view or refresh? Stay on main view as guest.
    } else {
        // Login logic (redirect to login view)
        showView(loginView);
    }
});

// Check Logic
checkPageBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
            mainError.textContent = 'Cannot scan browser internal pages.';
            return;
        }
        performCheck(tab.url);
    } else {
        mainError.textContent = 'Could not get current page URL.';
    }
});

checkManualBtn.addEventListener('click', () => {
    const text = manualInput.value.trim();
    if (text.length < 5) {
        mainError.textContent = 'Please enter at least 5 characters.';
        return;
    }
    performCheck(text);
});

backBtn.addEventListener('click', () => {
    showView(mainView);
});

async function performCheck(message) {
    showLoading(true);
    mainError.textContent = '';

    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(CHECK_API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ message })
        });

        if (response.status === 401) {
            // Token expired or invalid
            await chrome.storage.local.clear();
            authToken = null;
            showView(loginView);
            loginError.textContent = 'Session expired. Please login again.';
            return;
        }

        const data = await response.json();

        if (data.success && data.data) {
            displayResults(data.data);
        } else {
            mainError.textContent = data.message || 'Check failed.';
        }
    } catch (error) {
        mainError.textContent = 'Network error. Please try again.';
        console.error('Check error:', error);
    } finally {
        showLoading(false);
    }
}

function displayResults(data) {
    const result = data.result || {};
    const status = result.status || 'UNKNOWN';
    const riskScore = parseFloat(result.riskScore || result.confidence || 0);
    
    // Update UI
    statusText.textContent = status;
    riskScoreSpan.textContent = Math.round(riskScore * 100);
    analysisText.textContent = result.analysis || 'Analysis completed.';

    // Status Icon & Color
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.borderColor = '#95a5a6'; // Default gray

    if (status === 'SAFE') {
        statusIcon.textContent = '✅';
        statusText.style.color = '#27ae60';
        scoreCircle.style.borderColor = '#27ae60';
    } else if (status === 'SUSPICIOUS') {
        statusIcon.textContent = '⚠️';
        statusText.style.color = '#f39c12';
        scoreCircle.style.borderColor = '#f39c12';
    } else if (status === 'MALICIOUS') {
        statusIcon.textContent = '❌';
        statusText.style.color = '#c0392b';
        scoreCircle.style.borderColor = '#c0392b';
    } else {
        statusIcon.textContent = '❓';
        statusText.style.color = '#95a5a6';
    }

    // Warning Flags
    reasonsList.innerHTML = '';
    if (result.reasons && result.reasons.length > 0) {
        reasonsContainer.classList.remove('hidden');
        result.reasons.forEach(reason => {
            const li = document.createElement('li');
            li.textContent = reason;
            reasonsList.appendChild(li);
        });
    } else {
        reasonsContainer.classList.add('hidden');
    }

    showView(resultsView);
}
