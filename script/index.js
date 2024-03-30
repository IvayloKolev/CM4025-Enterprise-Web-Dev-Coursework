async function fetchRafflesAndUpdateList() {
    try {
        // Fetch data from the server to update the list of active raffles
        const response = await fetch('/all-raffles');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const raffleList = document.getElementById('active-raffles-list');

        // Filter out active raffles based on end date
        const currentDate = new Date();
        const activeRaffles = data.filter(raffle => new Date(raffle.endDate) > currentDate);

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
        let participants = raffle.participants.length > 0 ? raffle.participants.join(', ') : 'None';
        listItem.innerHTML = `
            <h3>${raffle.name}</h3>
            <p>Owner: Loading...</p>
            <p>Start Date: ${new Date(raffle.startDate).toLocaleString()}</p>
            <p>End Date: ${new Date(raffle.endDate).toLocaleString()}</p>
            <p id='participants-paragraph' style="display: none;">Participants: ${participants}</p>
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
            oownerParagraph.textContent = "Can't find owner" ;
        }

        // Fetch user data
        const userDataResponse = await fetch('/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const userData = await userDataResponse.json();

        // Check if a user is admin
        if (userData && userData.user && userData.user.type == 'admin') {
            const participantsParagraph = listItem.querySelector('#participants-paragraph');
            if (participantsParagraph) {
                participantsParagraph.style.display = 'block';
            }
        }

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
setInterval(fetchRafflesAndUpdateList, 30000); // 30 seconds

