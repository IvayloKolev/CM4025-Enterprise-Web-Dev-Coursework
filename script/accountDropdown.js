document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');

    // Add event listener to logout button
    logoutButton.addEventListener('click', async () => {
        // Send a request to the server to destroy the session
        fetch('/logout', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
        })
            .then(response => {
                if (response.ok) {
                    // Redirect to the login page after logout
                    window.location.href = '/html/index.html';
                }
            })
            .catch(error => console.error('Error logging out:', error));
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    // Get reference to dropdown content elements
    const myAccountBtton = document.getElementById('my-account-btn');
    const viewAccountButton = document.getElementById('account-btn');
    const logoutButton = document.getElementById('logout-btn');
    const signupButton = document.getElementById('signup-btn');
    const loginButton = document.getElementById('login-btn');
    const createRaffleButton = document.getElementById('create-raffle-btn');

    // User is not logged in by default, show signup and login buttons
    viewAccountButton.style.display = 'none'; // Hide view account button
    logoutButton.style.display = 'none'; // Hide logout button
    signupButton.style.display = 'block';
    loginButton.style.display = 'block';
    myAccountBtton.textContent = 'My Account';

    try {
        // Fetch user authentication status from the server
        const response = await fetch('/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const userData = await response.json(); // Parse response as JSON

        // Check if a user is admin
        if (userData && userData.user.type == 'admin' && createRaffleButton != null) {
            createRaffleButton.style.display = 'block'; // Show create-raffle button for admin users
        }

        if (response.ok && userData) {
            // User is logged in, show view account and logout buttons
            viewAccountButton.style.display = 'block';
            logoutButton.style.display = 'block';
            signupButton.style.display = 'none'; // Hide signup button
            loginButton.style.display = 'none'; // Hide login button
            myAccountBtton.textContent = 'Welcome ' + userData.user.username + '!';
        }

    } catch (error) {
        console.error('Error fetching user authentication status:', error);
    }
});

