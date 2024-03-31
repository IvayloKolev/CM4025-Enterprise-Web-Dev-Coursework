document.addEventListener("DOMContentLoaded", function () {
    const createRaffleForm = document.getElementById("create-raffle-form");

    if (createRaffleForm) { // Check if the form element exists
        createRaffleForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;
            const prize = document.getElementById("prize").value;

            try {
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
                            const userId = data.user._id;
                            // Send data to the server
                            sendDataToServer(name, startDate, endDate, prize, userId);
                        } else {
                            console.error("User data not found.");
                        }
                    });
            } catch (error) {
                console.error("Error getting user data:", error);
            }
        });
    } else {
        console.error("Form element not found.");
    }
});

// Function to send data to the server
async function sendDataToServer(name, startDate, endDate, prize, userId) {
    try {
        const response = await fetch("/create-raffle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                startDate,
                endDate,
                prize,
                userId
            })
        });

        if (!response.ok) {
            throw new Error("Failed to create raffle");
        }

        const responseData = await response.json();
        console.log(responseData); // Log the response from the server
        // Redirect to home page or show success message
        window.location.href = '/html/index.html';
    } catch (error) {
        console.error("Error creating raffle:", error);
        alert("Error creating raffle:", error);
        // Handle error - display error message to the user
    }
}