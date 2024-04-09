import { checkSession, getUserId} from './utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const createRaffleForm = document.getElementById("create-raffle-form");

    if (createRaffleForm) {
        createRaffleForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;
            const prize = document.getElementById("prize").value;

            try {
                const isAuthenticated = await checkSession();

                if (isAuthenticated) {
                    const userId = await getUserId();
                    // Send sanitized data to the server
                    sendDataToServer(name, startDate, endDate, prize, userId);
                } else {
                    console.error("User is not authenticated.");
                    // Handle case where user is not authenticated
                }
            } catch (error) {
                console.error("Error creating raffle:", error);
                // Handle error - display error message to the user
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
        
        // Check if the raffle was created successfully
        if (responseData && responseData.message === "Raffle created successfully") {
            // Display success message
            alert("Raffle created successfully");
            
            // Redirect to home page if raffle creation was successful
            window.location.href = '/html/index.html';
        } else {
            // Display error message if raffle creation failed
            throw new Error("Failed to create raffle");
        }
    } catch (error) {
        console.error("Error creating raffle:", error);
        // Handle error - display error message to the user
        alert("Error creating raffle:", error);
    }
}