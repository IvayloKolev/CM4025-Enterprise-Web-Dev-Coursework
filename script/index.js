async function fetchRafflesAndUpdateList() {
    try {
        // Fetch data from the server to update the list of active raffles
        const response = await fetch('/all-raffles');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const raffleList = document.getElementById('active-raffles-list');

        // Filter out raffles with end dates in the past
        const activeRaffles = data.filter(raffle => new Date(raffle.endDate) > new Date());

        activeRaffles.forEach(raffle => {
            // Check if the raffle already exists in the list
            if (!raffleList.querySelector(`li[data-raffle-id="${raffle.id}"]`)) {
                const listItem = document.createElement('li');
                listItem.setAttribute("data-raffle-id", raffle.id);
                let participants = raffle.participants.length > 0 ? raffle.participants.join(', ') : 'None';
                listItem.innerHTML = `
                    <h3>${raffle.name}</h3>
                    <p>Start Date: ${new Date(raffle.startDate).toLocaleString()}</p>
                    <p>End Date: ${new Date(raffle.endDate).toLocaleString()}</p>
                    <p>Draw Date: ${new Date(raffle.drawDate).toLocaleString()}</p>
                `;
                raffleList.appendChild(listItem);

                // Add event listener to the new list item
                addEventListenerToRaffleItem(listItem);
            }
        });
    } catch (error) {
        console.error('Error fetching or processing raffles:', error);
    }
}

// Function to add event listener to a list item
function addEventListenerToRaffleItem(item) {
    item.addEventListener('click', async () => {
        try {
            // Extract the raffle ID from the data attribute
            const raffleId = item.getAttribute('data-raffle-id');

            // Construct the URL for the raffle page with the raffle ID as a query parameter
            const url = `/html/raffle.html?id=${encodeURIComponent(raffleId)}`;

            // Redirect the user to the raffle page
            window.location.href = url;
        } catch (error) {
            console.error('Error redirecting to the raffle page:', error);
        }
    });
}

// Call fetchRafflesAndUpdateList initially
fetchRafflesAndUpdateList();

// Schedule periodic updates every thirty seconds
// 30000 for 30 sec, testing with 1
setInterval(fetchRafflesAndUpdateList, 1000);