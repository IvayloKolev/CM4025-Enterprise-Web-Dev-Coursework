const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

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
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const collection = db.collection("users");

    // Check if a user with the given email or username already exists
    const existingUser = await collection.findOne({
      $or: [
        { email }, // Check if there's a user with the same email
        { username }, // Check if there's a user with the same username
      ],
    });

    if (existingUser) {
      // User already exists, check if it's due to email or username
      if (existingUser.email === email) {
        console.log("Email already exists. Choose a different email.");
        return res.status(409).send("Email already exists. Choose a different email.");
      } else if (existingUser.username === username) {
        console.log("Username already exists. Choose a different username.");
        return res.status(409).send("Username already exists. Choose a different username.");
      }
    }

    // Generate user id
    const userId = uuidv4();

    // Hash password before storing it
    // 2^10 = 1024 rounds of hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into the collection
    const result = await collection.insertOne({
      _id: userId,
      email,
      username,
      password: hashedPassword,
    });

    console.log(`User inserted with _id: ${userId}`);

    res.redirect("/html/index.html"); // Redirect to the home page after successful signup
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
    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    const collection = db.collection("users");

    // Check if a user with the given email exists
    const user = await collection.findOne({ email });

    if (!user) {
      // User not found
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    // User found, check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incorrect password
      console.log("Incorrect password");
      return res.status(401).send("Incorrect password");
    }

    // Password is correct
    console.log("Login successful!");
    res.redirect("/html/index.html");

  } catch (error) {
    // Handle errors
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
