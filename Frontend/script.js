let API_URL = 'https://www.mailquell.com/';

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('loginButton');
    const status = document.getElementById('status');
    const loading = document.getElementById('loading');

    // Check if we're returning from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (code) {
        handleAuthCallback(code);
    } else if (error) {
        showStatus('Authentication failed: ' + error, 'error');
    }

    loginButton.addEventListener('click', initiateLogin);
});

async function initiateLogin() {
    showLoading(true);
    try {
         
        window.location.href = `${API_URL}/users/auth`;
        
    } catch (error) {
        console.error('Login failed:', error);
        showStatus('Failed to start login process', 'error');
        showLoading(false);
    }
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('hidden', !show);
}