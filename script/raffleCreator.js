const http = require('http');
const querystring = require('querystring');

const createRaffle = async () => {
    try {
        // Generate random details for the new raffle
        const prize = createPrizeName();
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes from now

        // Data to be sent in the request body
        const postData = querystring.stringify({
            name: `Raffle for ${prize}`,
            startDate,
            endDate,
            prize,
        });

        // Options for the HTTP request
        const options = {
            hostname: '192.168.17.128',
            port: 8080,
            path: '/create-raffle',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        // Make HTTP POST request to create a raffle
        const req = http.request(options, (res) => {
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', (data) => {
                console.log(data.toString());
            });
        });

        req.on('error', (error) => {
            console.error("Error creating raffle:", error);
        });

        // Write data to request body
        req.write(postData);
        req.end();
    } catch (error) {
        console.error("Error creating raffle:", error.message);
    }
};

// Function to generate a random prize name
const createPrizeName = () => {
    const prizeType = ["Red Dwarf", "Yellow Star", "Red Giant", "White Dwarf", "Pulsar", "Black Hole", "Comet", "Planet", "Asteroid"];
    const randomBody = prizeType[Math.floor(Math.random() * prizeType.length)];
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase(); // Random characters or numbers
    return `${randomBody}-${randomSuffix}`;
};

module.exports = createRaffle;
