const express = require("express");
const path = require("path");
const app = express();
const port = 8080;

const { MongoClient } = require("mongodb");
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

app.use(express.static(path.join(__dirname)));

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.17.128:${port}`);
});

// Database stuff
// Create a new MongoClient
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Establish and verify connectionconst
    adminDb = client.db("admin");
    if (adminDb) {
      await adminDb.command({ ping: 1 });
    }
    console.log("Connected successfully to server");
    console.log("Start the database stuff");

    //Write databse Insert/Update/Query code here..

    console.log("End the database stuff");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
