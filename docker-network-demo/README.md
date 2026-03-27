# Docker Network Demo

A simple Node.js + MongoDB app demonstrating Docker custom networking.

## What this app does
- Connects to MongoDB using the container name as hostname
- Has a simple UI to save and view messages stored in MongoDB
- Shows how containers talk to each other on a custom Docker network

## Steps to run (see chat for full walkthrough)
1. docker network create my-network
2. docker run -d --name mongo --network my-network mongo:7
3. docker build -t my-webapp .
4. docker run -d --name webapp --network my-network -p 3000:3000 my-webapp
5. Open http://localhost:3000
