document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const logoutButton = document.getElementById('logout-button');
    const prizeList = document.getElementById('prize-list');

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
            // Check if data exists and is not empty
            if (data && data.user) {
                const user = data.user;
                usernameElement.textContent = user.username;
                emailElement.textContent = user.email;

                // Update the prize list with user's prizes
                if (user.prizes && user.prizes.length > 0) {
                    console.log("Prizes: " + JSON.stringify(user.prizes));
                    prizeList.innerHTML = user.prizes.map(prize => `<li>${prize}</li>`).join('');
                } else {
                    prizeList.innerHTML = '<li>No prizes yet</li>';
                }
            } else {
                console.log("No user data found");
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

