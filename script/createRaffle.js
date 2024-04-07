import { checkSession, getUserId, sanitizeInput } from './utils.js';

document.addEventListener("DOMContentLoaded", function () {
    const createRaffleForm = document.getElementById("create-raffle-form");

    if (createRaffleForm) {
        createRaffleForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = sanitizeInput(document.getElementById("name").value);
            const startDate = sanitizeInput(document.getElementById("startDate").value);
            const endDate = sanitizeInput(document.getElementById("endDate").value);
            const prize = sanitizeInput(document.getElementById("prize").value);

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
        // Redirect to home page or show success message
        window.location.href = '/html/index.html';
    } catch (error) {
        console.error("Error creating raffle:", error);
        alert("Error creating raffle:", error);
        // Handle error - display error message to the user
    }
}