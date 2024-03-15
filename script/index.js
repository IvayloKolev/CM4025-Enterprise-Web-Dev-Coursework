async function fetchRafflesAndUpdateList() {
    try {
        // Fetch data from the server to update the list of active raffles
        const response = await fetch('/all-raffles');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const raffleList = document.getElementById('active-raffles-list');
        raffleList.innerHTML = '';

        // Filter out raffles with end dates in the past
        const activeRaffles = data.filter(raffle => new Date(raffle.endDate) > new Date());

        activeRaffles.forEach(raffle => {
            const listItem = document.createElement('li');
            let participants = raffle.participants.length > 0 ? raffle.participants.join(', ') : 'None';
            listItem.innerHTML = `
                <h3>${raffle.name}</h3>
                <h3>Prize: ${raffle.prize}<h3>
                <p>Start Date: ${new Date(raffle.startDate).toLocaleString()}</p>
                <p>End Date: ${new Date(raffle.endDate).toLocaleString()}</p>
                <p>Draw Date: ${new Date(raffle.drawDate).toLocaleString()}</p>
            `;
            raffleList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching or processing raffles:', error);
    }
}

// Call fetchRafflesAndUpdateList initially
fetchRafflesAndUpdateList();

// Schedule periodic updates every thirty seconds
setInterval(fetchRafflesAndUpdateList, 30000);
