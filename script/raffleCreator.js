const { MongoClient } = require("mongodb");

const createRaffle = async () => {
    const uri = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(uri);

    try {
        // Connect to MongoDB
        await client.connect();
        const db = client.db(); // Get the default database
        const collection = db.collection("raffles");

        // Get the number of existing raffles to set the new raffle's ID
        const numRaffles = await collection.countDocuments();
        const id = numRaffles + 1;

        // Generate random details for the new raffle

        const now = new Date();
        now.setSeconds(0); // Clear seconds
        now.setMilliseconds(0); // Clear milliseconds
        const startDate = now.toISOString().slice(0, -8); // Remove seconds and milliseconds

        const end = new Date(now.getTime() + 5 * 60 * 1000);
        end.setSeconds(0); // Clear seconds
        end.setMilliseconds(0); // Clear milliseconds
        const endDate = end.toISOString().slice(0, -8); // Remove seconds and milliseconds

        const draw = new Date(end.getTime() + 1 * 60 * 1000);
        draw.setSeconds(0); // Clear seconds
        draw.setMilliseconds(0); // Clear milliseconds
        const drawDate = draw.toISOString().slice(0, -8); // Remove seconds and milliseconds

        const prize = createPrizeName();

        // Create the new raffle object
        const newRaffle = {
            id,
            name: `Raffle for ${prize}`,
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