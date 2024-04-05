import { checkSession, getUserId } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');

    // Add event listener to logout button
    logoutButton.addEventListener('click', async () => {
        try {
            // Send a request to the server to destroy the session
            const response = await fetch('/logout', {
                method: 'GET',
                credentials: 'include', // Include cookies in the request
            });

            if (response.ok) {
                // Redirect to the login page after logout
                window.location.href = '/html/index.html';
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    // Get reference to dropdown content elements
    const myAccountButton = document.getElementById('my-account-btn');
    const viewAccountButton = document.getElementById('account-btn');
    const logoutButton = document.getElementById('logout-btn');
    const signupButton = document.getElementById('signup-btn');
    const loginButton = document.getElementById('login-btn');

    try {
        const isAuthenticated = await checkSession();

        if (isAuthenticated) {
            // User is logged in, show view account and logout buttons
            viewAccountButton.style.display = 'block';
            logoutButton.style.display = 'block';
            signupButton.style.display = 'none'; // Hide signup button
            loginButton.style.display = 'none'; // Hide login button

            // Get user ID to personalize the welcome message
            const userId = await getUserId();
            const userDataResponse = await fetch(`/user/${userId}`);
            const userData = await userDataResponse.json();

            if (userData && userData.user) {
                myAccountButton.textContent = 'Welcome ' + userData.user.username + '!';
            }
        } else {
            // User is not authenticated, show signup and login buttons
            viewAccountButton.style.display = 'none'; // Hide view account button
            logoutButton.style.display = 'none'; // Hide logout button
            signupButton.style.display = 'block';
            loginButton.style.display = 'block';
            myAccountButton.textContent = 'My Account';
        }
    } catch (error) {
        console.error('Error fetching user authentication status:', error);
    }
});
