document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const logoutButton = document.getElementById('logout-button');

    // Fetch user information from the server
    fetch('/profile', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            // Update the profile page with user information
            if (data.user) {
                usernameElement.textContent = data.user.username;
                emailElement.textContent = data.user.email;
            }
        })
        .catch(error => console.error('Error fetching user profile:', error));

    // Logout button click event
    logoutButton.addEventListener('click', () => {
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
