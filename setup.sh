#!/bin/bash

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y gnupg curl

# Download MongoDB public key and add it to the keyring
echo "Downloading MongoDB public key and adding it to the keyring..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Add MongoDB repository to the package manager
echo "Adding MongoDB repository to the package manager..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update the package manager's package lists
echo "Updating the package manager's package lists..."
sudo apt-get update

# Install MongoDB
echo "Installing MongoDB..."
sudo apt-get install -y mongodb-org

# Allow incoming traffic on port 8080 (for web applications) and 27017 (for MongoDB)
echo "Allowing incoming traffic on ports 8080 and 27017..."
sudo ufw allow 8080/tcp && sudo ufw allow 27017/tcp

# Clone the GitHub repository "CM4025-Enterprise-Web-Dev-Coursework"
echo "Cloning the GitHub repository 'CM4025-Enterprise-Web-Dev-Coursework'..."
git clone https://github.com/IvayloKolev/CM4025-Enterprise-Web-Dev-Coursework.git

# Start the MongoDB Server
echo "Starting the MongoDB server..."
mongod --dbpath CM4025-Enterprise-Web-Dev-Coursework/database

# Run npm install to install dependencies
echo "Installing dependencies..."
cd CM4025-Enterprise-Web-Dev-Coursework
npm install

# Start the MongoDB Server
echo "Starting the MongoDB Server..."
mongod --dbpath database
