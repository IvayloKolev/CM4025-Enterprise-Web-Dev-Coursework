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
            listItem.innerHTML = `Name: ${raffle.name},<br>
                              Start Date: ${new Date(raffle.startDate).toLocaleString()},<br>
                              End Date: ${new Date(raffle.endDate).toLocaleString()},<br>
                              Draw Date: ${new Date(raffle.drawDate).toLocaleString()},<br>
                              Prize: ${raffle.prize},<br>
                              Participants: ${participants}`; // Assuming participants is an array
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
