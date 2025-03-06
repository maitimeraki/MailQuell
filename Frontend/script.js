let API_URL = 'http://localhost:3000';

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

// async function handleAuthCallback(code) {
//     showLoading(true);
//     try {
//         const response = await fetch(`${API_URL}/auth/google/callback?code=${code}`);
//         const data = await response.json();
        
//         if (response.ok) {
//             showStatus('Login successful!', 'success');
//             // Redirect to main app after successful login
//             setTimeout(() => {
//                 window.location.href = '/webhook';
//             }, 1500);
//         } else {
//             throw new Error(data.error || 'Authentication failed');
//         }
//     } catch (error) {
//         console.error('Auth callback failed:', error);
//         showStatus('Authentication failed', 'error');
//     } finally {
//         showLoading(false);
//     }
// }

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('hidden', !show);
}