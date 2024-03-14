const { MongoClient } = require("mongodb");

const createRaffle = async () => {
    const uri = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(); // Get the default database
        const collection = db.collection("raffles");

        // Get the number of existing raffles to set the new raffle's ID
        const numRaffles = await collection.countDocuments();
        const id = numRaffles + 1;

        // Generate random details for the new raffle
        const name = `Raffle ${id}`;
        
	const now = new Date();
	now.setMilliseconds(0); // Clear milliseconds and round to nearest second
	const startDate = now.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, ''); // Current date and time

	const end = new Date(now.getTime() + 5 * 60 * 1000);
	end.setMilliseconds(0); // Clear milliseconds and round to nearest second
	const endDate = end.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, ''); // End date is 5 minutes from start date

	const draw = new Date(end.getTime() + 1 * 60 * 1000);
	draw.setMilliseconds(0); // Clear milliseconds and round to nearest second
	const drawDate = draw.toISOString().replace('T', ' ').replace(/\.\d{3}Z/, ''); // Draw date is 1 minute after end date


        const prize = createPrizeName();

        // Create the new raffle object
        const newRaffle = {
            id,
            name,
            startDate,
            endDate,
            drawDate,
            prize,
            participants: [],
            winner: null,
        };

        // Insert the new raffle into the collection
        await collection.insertOne(newRaffle);

        console.log(`Raffle created with ID: ${id}`);
    } catch (error) {
        throw new Error("Error creating raffle: " + error.message);
    } finally {
        // Close the MongoDB connection when done
        await client.close();
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

