const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cron = require('node-cron');
const createRaffle = require('./script/raffleCreator.js');

const app = express();
const port = 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

// Configure session management
const mongoStoreInstance = new MongoStore({
  mongoUrl: uri,
  collectionName: 'sessions',
  ttl: 60 * 60 * 24, // 24h
});

app.use(
  session({
    secret: 'TODO',
    resave: false,
    saveUninitialized: false,
    store: mongoStoreInstance,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24h
    },
  })
);

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
  const { email, username, password, userType } = req.body;

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

    // Set the default user type to "user" unless specified as admin
    let userType = "user";
    userType = userType || "user";


    // Insert user data into the collection
    const result = await collection.insertOne({
      _id: userId,
      type: userType,
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
    console.log("Creating login session");

    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      type: user.type,
    };

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

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    console.log("Logged out, session destroyed successfully");
    res.redirect('/html/index.html'); // Redirect to the login page after logout
  });
});

// Profile route
app.get("/profile", (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    // Send user information as JSON
    res.json({ user: req.session.user });
  } else {
    // If not logged in, redirect to the login page
    console.log("No logged in user");
    res.redirect('/html/login.html');
  }
});

// Create raffle route
app.post("/create-raffle", async (req, res) => {
  const { name, startDate, endDate, drawDate, prize } = req.body;

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const collection = db.collection("raffles");

    // Get the number of existing raffles to set the new raffle's ID
    const numRaffles = await collection.countDocuments();
    const id = numRaffles + 1;

    // Create the new raffle object
    const newRaffle = {
      id,
      name,
      startDate,
      endDate,
      drawDate,
      prize,
      participants: [],
      winner: null
    };

    // Insert the new raffle into the collection
    await collection.insertOne(newRaffle);

    console.log(`Raffle created with ID: ${id}`);

    res.status(201).send(`Raffle created with ID: ${id}`);
  } catch (error) {
    console.error("Error creating raffle:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// All Raffles route
app.get("/all-raffles", async (req, res) => {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const raffleCollection = db.collection("raffles");

    // Fetch all raffles from the collection
    const raffles = await raffleCollection.find().toArray();

    // Send the list of raffles as JSON response
    res.json(raffles);
  } catch (error) {
    console.error("Error fetching all raffles:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Get raffle by ID route
app.get("/raffle/:id", async (req, res) => {
  const raffleId = req.params.id;

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const collection = db.collection("raffles");

    // Find the raffle with the specified ID
    const raffle = await collection.findOne({ id: parseInt(raffleId) });

    if (raffle) {
      // If raffle found, send it as JSON response
      res.json(raffle);
    } else {
      // If raffle not found, return 404 error
      res.status(404).json({ error: "Raffle not found" });
    }
  } catch (error) {
    console.error("Error fetching raffle by ID:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});


// Creating Raffles
// '*/5 * * * *' for every 5 minutes
cron.schedule('*/5 * * * * *', async () => {
  try {
    await createRaffle();
    console.log('Raffle created and pushed to db.');
  } catch (error) {
    console.error('Error creating raffle:', error);
  }
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.17.128:${port}`);
});
