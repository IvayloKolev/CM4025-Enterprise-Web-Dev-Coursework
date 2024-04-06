import { checkAdmin, formatDate, addEventListenerToRaffleItem } from './utils.js';

async function fetchRafflesAndUpdateList() {
    try {
        // Fetch data from the server to update the list of active raffles
        const response = await fetch('/all-raffles');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const raffleList = document.getElementById('active-raffles-list');

        // Filter out active raffles based on the 'ended' field
        const activeRaffles = data.filter(raffle => !raffle.ended);

        // Remove ended raffles from the list
        const raffleItems = raffleList.querySelectorAll('li');

        raffleItems.forEach(item => {
            const raffleId = item.getAttribute('data-raffle-id');
            if (!activeRaffles.find(raffle => raffle.id === raffleId)) {
                raffleList.removeChild(item);
            }
        });

        activeRaffles.forEach(async raffle => {
            // Check if the raffle already exists in the list
            if (!raffleList.querySelector(`li[data-raffle-id="${raffle.id}"]`)) {
                const listItem = document.createElement('li');
                listItem.setAttribute("data-raffle-id", raffle.id);
                listItem.innerHTML = `
                    <h3>${raffle.name}</h3>
                    <p>Owner: Loading...</p>
                    <p>Start Date: ${formatDate(new Date(raffle.startDate))}</p>
                    <p>End Date: ${formatDate(new Date(raffle.endDate))}</p>
                `;
                raffleList.appendChild(listItem);

                // Fetch owner's information if owner ID is available
                if (raffle.owner) {
                    try {
                        const ownerDataResponse = await fetch(`/user/${raffle.owner}`);
                        if (!ownerDataResponse.ok) {
                            throw new Error('Failed to fetch owner data');
                        }
                        const ownerData = await ownerDataResponse.json();

                        if (ownerData && !ownerData.error) {
                            // Update owner's name in the list item
                            const ownerParagraph = listItem.querySelector('p:nth-child(2)');
                            if (ownerParagraph) {
                                ownerParagraph.textContent = `Owner: ${ownerData.name}`;
                            }
                        } else {
                            throw new Error('Owner data not found');
                        }
                    } catch (error) {
                        console.error('Error fetching owner data:', error);
                    }
                } else {
                    console.error('Owner ID not available for raffle:', raffle.id);
                    ownerParagraph.textContent = "Can't find owner";
                }

                // Add event listener to the new list item
                addEventListenerToRaffleItem(listItem);
            }
        });
    } catch (error) {
        console.error('Error fetching or processing raffles:', error);
    }
}

// Call fetchRafflesAndUpdateList initially
fetchRafflesAndUpdateList();

// Schedule periodic updates every thirty seconds
setInterval(fetchRafflesAndUpdateList, 30000); // 30 seconds
