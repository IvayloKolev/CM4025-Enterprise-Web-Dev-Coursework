import { checkSession, getUserData, formatDate, addEventListenerToRaffleItem } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM elements
    const usernameElement = document.getElementById('username');
    const emailElement = document.getElementById('email');
    const logoutButton = document.getElementById('logout-btn');
    const prizeList = document.getElementById('prize-list');
    const activeRafflesInList = document.getElementById('active-raffles-in-list');
    const activeRafflesOwnList = document.getElementById('active-raffles-own-list');

    try {
        // Check if the session exists
        const sessionExists = await checkSession();
        if (!sessionExists) {
            window.location.href = '/html/index.html';
            throw new Error('Session does not exist');
        }

        // Fetch user data
        const userData = await getUserData();

        // Display user information
        if (userData) {
            usernameElement.textContent = userData.username;
            emailElement.textContent = userData.email;

            // Display user prizes
            if (userData.prizes && userData.prizes.length > 0) {
                prizeList.innerHTML = userData.prizes.map(prize => `<li>${prize}</li>`).join('');
            } else {
                prizeList.innerHTML = '<li>No prizes yet</li>';
            }

            // Fetch all raffles
            const allRafflesResponse = await fetch('/all-raffles', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const allRaffles = await allRafflesResponse.json();

            // Display active raffles the user is in
            const activeRafflesIn = allRaffles.filter(raffle => userData.raffles.includes(raffle.id) && !raffle.ended);
            if (activeRafflesIn.length > 0) {
                activeRafflesIn.forEach(raffle => {
                    const listItem = document.createElement('li');
                    listItem.textContent = raffle.name;
                    activeRafflesInList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'None';
                activeRafflesInList.appendChild(listItem);
            }

            // Display active raffles the user owns
            const ownedRaffles = allRaffles.filter(raffle => raffle.owner === userData._id);
            if (ownedRaffles.length > 0) {
                ownedRaffles.forEach(raffle => {
                    const listItem = document.createElement('li');
                    listItem.textContent = raffle.name;
                    activeRafflesOwnList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'None';
                activeRafflesOwnList.appendChild(listItem);
            }
        } else {
            console.log('No user data found');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    // Event listener for logout button
    logoutButton.addEventListener('click', async () => {
        try {
            // Perform logout
            const response = await fetch('/logout', {
                method: 'GET',
                credentials: 'include', // Include cookies in the request
            });
            if (response.ok) {
                window.location.href = '/html/index.html'; // Redirect to the index page after logout
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    });
});
