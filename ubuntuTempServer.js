const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname)));

// MongoDB Connection
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Serve the index.html file
app.get("/", async (req, res) => {
  try {
    await client.connect(); // Connect to MongoDB

    const db = client.db(); // Get the default database
    const collection = db.collection("your_collection_name"); // Replace with your collection name

    // Perform MongoDB operations
    const documents = await collection.find().toArray();

    // Send the index.html file
    res.sendFile(path.join(__dirname, "html", "index.html"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    await client.close(); // Close the MongoDB connection when done
  }
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.17.128:${port}`);
});

