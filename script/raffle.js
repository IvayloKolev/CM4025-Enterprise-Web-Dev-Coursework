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
            // Populate the page with the retrieved raffle information
            document.getElementById('raffle-name').innerText = data.name;
            document.getElementById('raffle-prize-header').innerText = data.prize;
            document.getElementById('raffle-prize').innerText = data.prize;
            document.getElementById('raffle-start-date').innerText = data.startDate;
            document.getElementById('raffle-end-date').innerText = data.endDate;

            document.title = data.name;
        })
        .catch(error => {
            console.error('Error fetching or processing raffle information:', error);
        });
}

// Function to enter the raffle
async function enterRaffle(raffleId, userId) {
    try {
        console.log("Attempt to enter raffle with raffleId:", raffleId, "and userId:", userId);
        
        const requestBody = JSON.stringify({ raffleId: raffleId.toString(), userId });
        
        console.log("Request body:", requestBody);
        
        const response = await fetch("/enter-raffle", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        console.log("Enter raffle response received:", response);

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
        console.log("Attempt to leave raffle with raffleId:", raffleId, "and userId:", userId);
        
        const requestBody = JSON.stringify({ raffleId: raffleId.toString(), userId });
        
        console.log("Request body:", requestBody);
        
        const response = await fetch("/leave-raffle", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });

        console.log("Leave raffle response received:", response);

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

document.addEventListener('DOMContentLoaded', () => {
    const enterRaffleButton = document.getElementById('enter-raffle-button');
    const leaveRaffleButton = document.getElementById('leave-raffle-button'); // New button
    const raffleId = parseInt(getQueryParam('id'));

    // Fetch user information when the DOM is loaded
    fetch('/profile', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.user) {
            const userId = data.user._id; // Get the user ID
            
            // Add event listener to enter raffle button
            enterRaffleButton.addEventListener('click', () => {
                // Call enterRaffle function with both raffle ID and user ID
                enterRaffle(raffleId, userId);
            });

            // Add event listener to leave raffle button
            leaveRaffleButton.addEventListener('click', () => {
                // Call leaveRaffle function with both raffle ID and user ID
                leaveRaffle(raffleId, userId);
            });
        } else {
            console.error('User information not found');
        }
    })
    .catch(error => console.error('Error fetching user profile:', error));

    // Fetch raffle information when the DOM is loaded
    fetchRaffleInfo(raffleId);
});
