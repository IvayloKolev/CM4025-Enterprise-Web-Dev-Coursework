// Function to check if a session exists
export async function checkSession() {
    try {
        const response = await fetch('/check-session', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("Check Session Response Status: " + response.status);
        return response.ok;
    } catch (error) {
        console.error('Error checking session:', error);
        return false;
    }
}

// Function to get the user ID
export async function getUserId() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                return data.user._id;
            } else {
                throw new Error('User data not found');
            }
        } else {
            throw new Error('Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error; // Propagate the error to the caller
    }
}

// Function to check if the user is an admin
export async function checkAdmin() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.user && data.user.type === 'admin') {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error('Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error checking if user is admin:', error);
        return false;
    }
}

// Function to get user data
export async function getUserData() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include', // Include cookies in the request
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.user) {
                return data.user;
            } else {
                return null;
            }
        } else {
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Function to add event listener to a raffle list item that links to its page
export function addEventListenerToRaffleItem(item) {
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

// Function to format date as DD/MM/YYYY
export function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedYear = year < 10 ? '0' + year : year;
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${formattedDay}/${formattedMonth}/${formattedYear} ${formattedHours}:${formattedMinutes}`;
}

// Function to sanitize text input using regular expressions
export function sanitizeInput(input) {
    const pattern = /<[^>]*>?|[^a-zA-Z0-9\s\-,.]/g;
    const sanitizedInput = input.replace(pattern, '');

    return sanitizedInput;
}