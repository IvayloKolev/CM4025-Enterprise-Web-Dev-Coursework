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
    const viewAccountButton = document.getElementById('account-btn');
    const logoutButton = document.getElementById('logout-btn');
    const signupButton = document.getElementById('signup-btn');
    const loginButton = document.getElementById('login-btn');
    const createRaffleButton = document.getElementById('create-raffle-btn'); // Add this line

    try {
        // Fetch user authentication status from the server
        const response = await fetch('/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const userData = await response.json(); // Parse response as JSON

        if (userData && userData.type === 'admin') {
            createRaffleButton.style.display = 'block'; // Show create-raffle button for admin users
        }

        if (response.ok) {
            // User is logged in, show view account and logout buttons
            viewAccountButton.style.display = 'block';
            logoutButton.style.display = 'block';
            signupButton.style.display = 'none'; // Hide signup button
            loginButton.style.display = 'none'; // Hide login button
        } else {
            // User is not logged in, show signup and login buttons
            viewAccountButton.style.display = 'none'; // Hide view account button
            logoutButton.style.display = 'none'; // Hide logout button
            signupButton.style.display = 'block';
            loginButton.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching user authentication status:', error);
    }
});
