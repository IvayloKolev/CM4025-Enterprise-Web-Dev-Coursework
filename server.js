const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cron = require('node-cron');

const app = express();
const port = 8080;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname)));

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const db = "production";
const uri = "mongodb://127.0.0.1:27017/" + db;
const client = new MongoClient(uri);

// Configure session management
const mongoStoreInstance = new MongoStore({
  mongoUrl: uri,
  collectionName: 'sessions',
  ttl: 60 * 60 * 24, // 24h
});

app.use(session({
  secret: 'kittymittens',
  resave: false,
  saveUninitialized: false,
  store: mongoStoreInstance,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24h
}));

// Routes

// Serve the index.html file
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
  console.log("Signup Route");
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
      raffles: [],
      prizes: []
    });

    console.log(`User inserted with _id: ${userId}`);

    // Automatically log in the user after signup
    req.session.user = {
      _id: userId,
      email,
      username,
      type: userType,
      raffles: [],
      prizes: [],
    };

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
  console.log("Login Route");
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
      raffles: user.raffles,
      prizes: user.prizes
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
  console.log("Logout Route");
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
  console.log("Profile Route");
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

// Check session route
app.get("/check-session", (req, res) => {
  console.log("Check Session Route");
  // Check if the user is logged in
  if (req.session.user) {
    // Session exists
    res.status(200).send('Session exists');
  } else {
    // No session exists
    res.status(404).send('No session exists');
  }
});

// User info by id route
app.get("/user/:id", async (req, res) => {
  try {
    console.log("User info by id Route");
    const userId = req.params.id;

    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    const collection = db.collection("users");

    // Find the user by ID
    const user = await collection.findOne({ _id: userId });

    if (user) {
      // If user found, send their information as JSON response
      res.json({ name: user.username, email: user.email });
    } else {
      // If user not found, return 404 error
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Continue as Guest route
app.post("/continue-as-guest", async (req, res) => {
  try {
    const guestUserId = uuidv4();

    const userType = 'guest';

    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const collection = db.collection("users");

    await collection.insertOne({
      _id: guestUserId,
      type: userType,
      email: null,
      username: "guest",
      raffles: null,
      prizes: []
    });

    req.session.user = {
      _id: guestUserId,
      type: userType,
      email: null,
      username: "guest",
      raffles: null,
      prizes: []
    };

    res.status(200).send("Guest user created successfully");
  } catch (error) {
    console.error("Error creating guest user:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.close();
  }
});

// Enter Raffle route
app.post("/enter-raffle", async (req, res) => {
  try {
    console.log("Enter Raffle route");
    const { userId, raffleId } = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const raffles = db.collection("raffles");

    // Find the raffle with the specified ID
    const raffle = await raffles.findOne({ id: parseInt(raffleId) });

    if (!raffle) {
      // If raffle not found, return 404 error
      return res.status(404).json({ error: "Raffle not found" });
    }

    if (raffle.ended) {
      // If raffle has ended, return error
      return res.status(400).json({ error: "Raffle has ended" });
    }

    // Add the user's ID to the participants array
    const result = await raffles.updateOne(
      { id: parseInt(raffleId) },
      { $push: { participants: userId } }
    );

    // Send a success response
    res.status(200).send("You have successfully entered the raffle");
  } catch (error) {
    console.error("Error entering the raffle:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Leave Raffle route
app.post("/leave-raffle", async (req, res) => {
  try {
    console.log("Leave Raffle route");
    const { userId, raffleId } = req.body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const raffles = db.collection("raffles");

    // Find the raffle with the specified ID
    const raffle = await raffles.findOne({ id: parseInt(raffleId) });

    if (!raffle) {
      // If raffle not found, return 404 error
      return res.status(404).json({ error: "Raffle not found" });
    }

    // Remove the user's ID from the participants array
    const result = await raffles.updateOne(
      { id: parseInt(raffleId) },
      { $pull: { participants: userId } }
    );

    // Send a success response
    res.status(200).send("You have successfully left the raffle");
  } catch (error) {
    console.error("Error leaving the raffle:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Create raffle route
app.post("/create-raffle", async (req, res) => {
  console.log("Create Raffle Route");
  const { name, startDate, endDate, prize, userId } = req.body;

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const collection = db.collection("raffles");

    const raffleCount = await collection.countDocuments();

    // Calculate the new raffle ID
    const raffleId = raffleCount + 1;

    // Create the new raffle object
    const newRaffle = {
      id: raffleId,
      name,
      startDate,
      endDate,
      ended: false,
      prize,
      prizeClaimed: false,
      participants: [],
      winner: null,
      owner: userId
    };

    // Insert the new raffle into the collection
    await collection.insertOne(newRaffle);

    // Update the user's raffles list with the new raffle ID
    const userCollection = db.collection("users");
    await userCollection.updateOne(
      { _id: userId },
      { $push: { raffles: newRaffle.id } }
    );

    console.log(`Raffle created with ID: ${raffleId}`);

    // Send a success response
    res.status(201).json({ message: "Raffle created successfully", raffle: newRaffle });
  } catch (error) {
    console.error("Error creating raffle:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// All Raffles route
app.get("/all-raffles", async (req, res) => {
  console.log("Get All Raffles Route");
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
  console.log("Get Raffle by ID Route");
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

// Check raffle end dates every minute
// '* * * * *'
cron.schedule('* * * * *', async () => {
  try {
    console.log("Checking raffle end dates");
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const raffles = db.collection("raffles");

    // Find all active raffles whose end dates have passed but winners have not been selected
    const expiredRaffles = await raffles.find({ ended: false }).toArray();

    const currentDate = new Date();

    for (const raffle of expiredRaffles) {
      const endDate = new Date(raffle.endDate);

      if (!isNaN(endDate) && endDate <= currentDate) {
        await selectWinner(raffle.id);
      }
    }
  } catch (error) {
    console.error("Error checking raffle end dates:", error);
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
});

// Select a Winner function
async function selectWinner(raffleId) {
  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db(); // Get the default database
    const raffles = db.collection("raffles");
    const users = db.collection("users");

    const raffle = await raffles.findOne({ id: parseInt(raffleId) });

    if (!raffle) {
      console.error("Raffle not found");
      return;
    }

    if (raffle.participants.length == 0) {
      console.log("Raffle " + raffleId + " has ended with no participants. No winner is drawn");
      await raffles.updateOne(
        { id: parseInt(raffleId) },
        { $set: { ended: true, winner: null } }
      );
      return;
    }

    // Select a random winner from the participants list
    const winnerIndex = Math.floor(Math.random() * raffle.participants.length);
    const winnerId = raffle.participants[winnerIndex];

    // Get the user's entry to check their type
    const winnerUser = await users.findOne({ _id: winnerId });

    if (!winnerUser) {
      console.error("Winner user not found");
      return;
    }

    // Update the raffle object with the winner's information and prizeClaimed
    await raffles.updateOne(
      { id: parseInt(raffleId) },
      { $set: { winner: winnerId, ended: true, prizeClaimed: winnerUser.type !== 'guest' } }
    );

    // Get the prize string
    const prize = raffle.prize;

    await users.updateOne(
      { _id: winnerId },
      { $push: { prizes: prize } }
    );

    console.log(`Winner selected for raffle ${raffleId}: ${winnerId}`);
  } catch (error) {
    console.error("Error selecting winner:", error);
  } finally {
    // Close the MongoDB connection when done
    await client.close();
  }
}

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://192.168.17.128:${port}`);
});