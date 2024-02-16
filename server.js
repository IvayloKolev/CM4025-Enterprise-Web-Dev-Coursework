const express = require("express");
const path = require("path");

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname)));

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "html", "index.html"));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://192.168.17.128:${port}`);
});
