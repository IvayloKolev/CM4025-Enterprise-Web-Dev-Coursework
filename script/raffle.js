// Function to parse query parameters from URL
function getQueryParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
}

// Get the raffle ID from the query parameters
const raffleId = getQueryParam('id');

// Fetch raffle information from the server based on the raffle ID
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
        document.getElementById('raffle-draw-date').innerText = data.drawDate;
    })
    .catch(error => {
        console.error('Error fetching or processing raffle information:', error);
    });
