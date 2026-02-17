async function acceptTerms() {
    try {
        await fetch('/auth/accept-tos', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        // Get redirect URL from query params
        const urlParams = new URLSearchParams(window.location.search); // creates an object specifically designed to work with URL query parameters.
        const redirectUrl = urlParams.get('redirect');
        
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Failed to accept terms:', error);
        alert('Failed to accept terms. Please try again.');
    }
}
