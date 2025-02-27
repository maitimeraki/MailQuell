// const API_URL = 'http://localhost:3000'; // Update with your backend URL

// // State management
// let isAuthenticated = true;
// let currentEmails = [];

// // DOM Elements
// const authButton = document.getElementById('auth-button');
// const emailList = document.getElementById('email-list');
// const loading = document.getElementById('loading');
// // Event listeners        

// // Check authentication status on page load
// async function checkAuthStatus() {
//     try {
//         // const response = await fetch(`${API_URL}/auth`, {
//         //     credentials: 'include',
//         //     headers: {
//         //         'Accept': 'application/json',
//         //         'Content-Type': 'application/json'
//         //     }
//         // }) ;
//         window.location.href = `${API_URL}/auth`;
//         window.location.href =  '/index.html';

//         // console.log(response);
//         // const data = await response.json();
//         // console.log(data);
//         // isAuthenticated = data.isAuthenticated;
//         // updateAuthUI();
//     } catch (error) {
//         console.error('Auth check failed:', error);
//     }
// }

// // Update UI based on auth status
// function updateAuthUI() {
//     authButton.textContent = isAuthenticated ? 'Logout' : 'Login with Gmail';
//     authButton.onclick = isAuthenticated ? handleLogout : handleAuth;
// }

// // Handle authentication
// // async function handleAuth() {
// //     try {
// //         const response = await fetch(`${API_URL}/auth/google/callback`);
// //         const data = await response.json();
// //         window.location.href = data.url;
// //     } catch (error) {
// //         console.error('Auth failed:', error);
// //         alert('Authentication failed. Please try again.');
// //     }                       
// // }

// // Handle logout
// async function handleLogout() {
//     try {
//         await fetch(`${API_URL}/auth/logout`, {
//             credentials: 'include'
//         });
//         isAuthenticated = false;
//         updateAuthUI();
//         emailList.innerHTML = '';
//     } catch (error) {
//         console.error('Logout failed:', error);
//     }
// }

// // Fetch emails from sender
// async function fetchEmails() {
//     await checkAuthStatus();
//     if (!isAuthenticated) {
//         alert('Please login first');
//         return;
//     }

//     const senderEmail = document.getElementById('sender-email').value;
//     if (!senderEmail) {
//         alert('Please enter sender email');
//         return;
//     }

//     showLoading(true);
//     try {
//         const response = await fetch(`${API_URL}/show-emails/${encodeURIComponent(senderEmail)}`, {
//             credentials: 'include'
//         });
//         const emails = await response.json();
//         displayEmails(emails);
//     } catch (error) {
//         console.error('Failed to fetch emails:', error);
//         alert('Failed to fetch emails. Please try again.');
//     } finally {
//         showLoading(false);
//     }
// }

// // Display emails in UI
// function displayEmails(emails) {
//     currentEmails = emails;
//     emailList.innerHTML = emails.length ? emails.map((email, index) => `
//         <div class="email-item">
//             <div class="email-header">
//                 <span class="email-subject">${email.subject || 'No Subject'}</span>
//                 <span class="email-date">${new Date(email.date).toLocaleString()}</span>
//             </div>
//             <div class="email-snippet">${email.snippet}</div>
//             <button onclick="deleteEmail(${index})" class="delete-btn">Delete</button>
//         </div>
//     `).join('') : '<p>No emails found</p>';
// }

// // Delete single email
// async function deleteEmail(index) {
//     if (!confirm('Are you sure you want to delete this email?')) return;

//     const email = currentEmails[index];
//     showLoading(true);
//     try {
//         const response = await fetch(`${API_URL}/delete-email`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             credentials: 'include',
//             body: JSON.stringify({ messageId: email.id })
//         });

//         if (response.ok) {
//             currentEmails.splice(index, 1);
//             displayEmails(currentEmails);
//         } else {
//             throw new Error('Failed to delete email');
//         }
//     } catch (error) {
//         console.error('Delete failed:', error);
//         alert('Failed to delete email. Please try again.');
//     } finally {
//         showLoading(false);
//     }
// }

// // Loading indicator
// function showLoading(show) {
//     loading.classList.toggle('hidden', !show);
// }

// // Initialize
// document.addEventListener('DOMContentLoaded', () => {
//     checkAuthStatus();
// });

// // Handle OAuth callback
// if (window.location.search.includes('code=')) {
//     showLoading(true);
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get('code');

//     fetch(`${API_URL}/auth/callback?code=${code}`, {
//         credentials: 'include'
//     })
//         .then(response => response.json())
//         .then(data => {
//             isAuthenticated = true;
//             updateAuthUI();
//             history.pushState({}, '', '/');
//         })
//         .catch(error => {
//             console.error('Auth callback failed:', error);
//             alert('Authentication failed. Please try again.');
//         })
//         .finally(() => {
//             showLoading(false);
//         });
// }

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
        // console.log('initiating login');
        // console.log(API_URL);
     
        // const response = await fetch( `${API_URL}/auth`,{
        //     method: 'GET',
        //     credentials: 'include',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     mode:"cors"
        // });
        // console.log(response);
        // if(!response.ok){
        //     throw new Error(`Failed to initiate login ${response.status}`);
        // } 
        // const data = await response.json();
        // if (data.url) {
        //     window.location.href = data.url;
        // } else {
        //     throw new Error('No auth URL received');
        // }
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