const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const {v4: uuidv4} = require("uuid");

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Serve the index.html file
app.get("/", async (req, res) => {
  try {
    await client.connect(); // Connect to MongoDB

    const db = client.db(); // Get the default database
    const collection = db.collection("temp_name");

    // Perform MongoDB operations
    const documents = await collection.find().toArray();

    // Send the index.html file
    res.sendFile(path.join(__dirname, "html", "index.html"));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Signup route
app.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    await client.connect(); // Connect to MongoDB

    const db = client.db(); // Get the default database
    const collection = db.collection("users");

    // Generate user id
    const userId = uuidv4();

    // Insert user data into the collection
    const result = await collection.insertOne({
      _id: userId,
      email,
      username,
      password,
    });

    console.log(`User inserted with _id: ${userId}`);

    res.redirect("/html/index.html"); // Redirect to home page after successful signup
  } catch (error) {
    console.error("Error processing signup:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    await client.connect(); // Connect to MongoDB

    const db = client.db(); // Get the default database
    const collection = db.collection("users");

    // Check if a user with the given email exists
    const user = await collection.findOne({ email });

    if (user) {
      // User found, check if the password is correct
      if (user.password === password) {
        console.log("Login successful!");
        res.redirect("/html/index.html"); // Redirect to home page after successful login
      } else {
        console.log("Incorrect password");
        res.status(401).send("Incorrect password");
      }
    } else {
      console.log("User not found");
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error processing login:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.17.128:${port}`);
});
