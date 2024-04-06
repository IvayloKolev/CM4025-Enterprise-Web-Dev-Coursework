import { checkSession, formatDate, getUserId } from './utils.js';

// Function to parse query parameters from URL
function getQueryParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
}

// Fetch raffle information from the server based on the raffle ID
function fetchRaffleInfo(raffleId) {
    fetch(`/raffle/${raffleId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Parse and format start date
            const startDate = new Date(data.startDate);
            const formattedStartDate = formatDate(startDate);

            // Parse and format end date
            const endDate = new Date(data.endDate);
            const formattedEndDate = formatDate(endDate);

            // Populate the page with the retrieved raffle information
            document.getElementById('raffle-name').innerText = data.name;
            document.getElementById('raffle-prize-header').innerText = data.prize;
            document.getElementById('raffle-prize').innerText = data.prize;
            document.getElementById('raffle-start-date').innerText = formattedStartDate;
            document.getElementById('raffle-end-date').innerText = formattedEndDate;

            document.title = data.name;
        })
        .catch(error => {
            console.error('Error fetching or processing raffle information:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const enterRaffleButton = document.getElementById('enter-raffle-button');
    const leaveRaffleButton = document.getElementById('leave-raffle-button');
    const raffleId = parseInt(getQueryParam('id'));

    // Add event listener to enter raffle button
    enterRaffleButton.addEventListener('click', async () => {
        try {
            const sessionExists = await checkSession();

            if (!sessionExists) {
                // Session doesn't exist, show confirmation dialog
                showConfirmationDialog();
                return; // Exit the function
            }

            // User is logged in, proceed with entering the raffle
            const userId = await getUserId();
            enterRaffle(raffleId, userId);
        } catch (error) {
            console.error('Error checking session:', error);
            alert('An error occurred. Please try again later.');
        }
    });

    // Add event listener to leave raffle button
    leaveRaffleButton.addEventListener('click', async () => {
        try {
            const sessionExists = await checkSession();

            if (sessionExists) {
                // Session exists, proceed with leaving the raffle
                const userId = await getUserId();
                leaveRaffle(raffleId, userId);
            } else {
                // Session doesn't exist, prompt the user to log in
                showConfirmationDialog();
            }
        } catch (error) {
            console.error('Error checking session:', error);
            alert('An error occurred. Please try again later.');
        }
    });

    fetchRaffleInfo(raffleId);
});

// Function to show confirmation dialog
async function showConfirmationDialog() {
    try {
        const sessionExists = await checkSession();

        if (!sessionExists) {
            // Session doesn't exist, user is not logged in
            const confirmation = confirm('You are not logged in. Do you want to continue as a guest?');
            if (confirmation) {
                continueAsGuest();
            } else {
                window.location.href = '/html/login.html'; // Redirect to login page
            }
        }
    } catch (error) {
        console.error('Error checking session:', error);
        alert('An error occurred. Please try again later.');
    }
}

// Function to continue as guest
async function continueAsGuest() {
    try {
        const response = await fetch("/continue-as-guest", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('You have successfully entered the raffle as a guest!');
        } else {
            alert('Failed to continue as a guest. Please try again later.');
        }
    } catch (error) {
        console.error('Error continuing as guest:', error);
        alert('An error occurred while continuing as a guest. Please try again later.');
    }
}

// Function to enter the raffle
async function enterRaffle(raffleId, userId) {
    try {
        const requestBody = JSON.stringify({ raffleId: raffleId.toString(), userId });

        const response = await fetch("/enter-raffle", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        if (response.ok) {
            alert('You have successfully entered the raffle!');
        } else {
            alert('Failed to enter the raffle. Please try again later.');
        }
    } catch (error) {
        console.error('Error entering the raffle:', error);
        alert('An error occurred while entering the raffle. Please try again later.');
    }
}

// Function to leave the raffle
async function leaveRaffle(raffleId, userId) {
    try {
        const requestBody = JSON.stringify({ raffleId: raffleId.toString(), userId });

        const response = await fetch("/leave-raffle", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        if (response.ok) {
            alert('You have successfully left the raffle!');
        } else {
            alert('Failed to leave the raffle. Please try again later.');
        }
    } catch (error) {
        console.error('Error leaving the raffle:', error);
        alert('An error occurred while leaving the raffle. Please try again later.');
    }
}
