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
            console.log('Raffle data:', data);
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
async function enterRaffle(raffleId) {
    try {
        // Send a request to the server to enter the raffle
        const response = await fetch("/enter-raffle", {
            method: 'POST',
            credentials: 'include', // Include cookies in the request
            body: JSON.stringify({ raffleId }), // Send the raffle ID in the request body
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Raffle entry successful, display a success message to the user
            alert('You have successfully entered the raffle!');
        } else {
            // Raffle entry failed, display an error message to the user
            alert('Failed to enter the raffle. Please try again later.');
        }
    } catch (error) {
        console.error('Error entering the raffle:', error);
        // Display an error message to the user
        alert('An error occurred while entering the raffle. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const enterRaffleButton = document.getElementById('enter-raffle-button');
    const raffleId = parseInt(getQueryParam('id'));

    // Fetch raffle information when the DOM is loaded
    fetchRaffleInfo(raffleId);

    // Add event listener to enter raffle button
    enterRaffleButton.addEventListener('click', () => {
        // Call enterRaffle function when the button is clicked
        enterRaffle(raffleId);
    });
});

