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
                    listItem.setAttribute("data-raffle-id", raffle.id);
                    listItem.innerHTML = `
                    <h3>${raffle.name}</h3>
                    <p>Prize: ${raffle.prize}</p>
                    <p>End Date: ${formatDate(new Date(raffle.endDate))}</p>
                `;
                    activeRafflesInList.appendChild(listItem);
                    addEventListenerToRaffleItem(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'None';
                activeRafflesInList.appendChild(listItem);
            }

            // Display raffles the user owns
            const ownedRaffles = allRaffles.filter(raffle => raffle.owner === userData._id);
            if (ownedRaffles.length > 0) {
                ownedRaffles.forEach(raffle => {
                    const listItem = document.createElement('li');
                    listItem.setAttribute("data-raffle-id", raffle.id);
                    listItem.innerHTML = `
        <h3>${raffle.name}</h3>
        <p>Prize: ${raffle.prize}</p>
        <p>End Date: ${formatDate(new Date(raffle.endDate))}</p>
        <button class="end-raffle-btn action-button" data-raffle-id="${raffle.id}">End Now</button>
    `;
                    activeRafflesOwnList.appendChild(listItem);
                    addEventListenerToRaffleItem(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'None';
                activeRafflesOwnList.appendChild(listItem);
            }

            // Add event listener for "End now" buttons
            const endRaffleButtons = document.querySelectorAll('.end-raffle-btn');
            endRaffleButtons.forEach(button => {
                button.addEventListener('click', async (event) => {
                    // Prevent the click event from propagating to the list item
                    event.stopPropagation();

                    const raffleId = event.target.getAttribute('data-raffle-id');
                    try {
                        // Send a request to end the raffle
                        const response = await fetch('/end-raffle', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ raffleId }),
                        });
                        if (response.ok) {
                            // Raffle ended successfully
                            console.log(`Raffle ${raffleId} ended successfully`);
                            // Refresh the page or perform any necessary actions
                        } else {
                            // Raffle could not be ended
                            console.error(`Error ending raffle ${raffleId}: ${response.statusText}`);
                        }
                    } catch (error) {
                        console.error(`Error ending raffle ${raffleId}: ${error}`);
                    }
                });
            });
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
