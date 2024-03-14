const cron = require('node-cron');

cron.schedule('*/1 * * * *', async () => {

    // Fetch data from the server every minute to keep up to date
    fetch('/all-raffles')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(raffles => {
            // Filter out raffles with end dates in the past
            const activeRaffles = raffles.filter(raffle => new Date(raffle.endDate) > new Date());

            // Populate the list with active raffles
            const raffleList = document.getElementById('active-raffles-list');
            activeRaffles.forEach(raffle => {
                const listItem = document.createElement('li');
                listItem.textContent = `${raffle.name}: ${raffle.prize}`;
                raffleList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Error fetching or processing raffles:', error);
        });
});
