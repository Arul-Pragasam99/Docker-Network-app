# Docker Network Demo 🐳

A Node.js + MongoDB app demonstrating Docker custom networking.
Containers talk to each other using container names as hostnames — no hardcoded IPs needed.

---

## Project Structure

```
docker-network-demo/
├── app.js          # Express + Mongoose app
├── package.json    # Dependencies
├── Dockerfile      # Image build instructions
└── .dockerignore   # Files to exclude from image
```

---

## How It Works

```
Browser → http://localhost:3000
              ↓
        [webapp container]        my-network
        Node.js + Express   ──────────────────→  [mongo container]
        port 3000:3000                            MongoDB
                                                  port 27018:27017
```

- Both containers are on the same custom network called `my-network`
- The Node.js app connects to MongoDB using the container name as hostname: `mongodb://mongo:27017`
- Docker automatically resolves the container name to its internal IP (built-in DNS)
- MongoDB port is mapped to `27018` on the host to avoid conflict with any locally installed MongoDB

---

## Prerequisites

- Docker installed and running
- MongoDB Compass (optional, to view data visually)

---

## Step by Step Commands

### Step 1 — Create the custom Docker network
```bash
docker network create my-network
```

### Step 2 — Run MongoDB container on the network
```bash
docker run -d --name mongo --network my-network -p 27018:27017 mongo:7
```
- `--name mongo` → sets the hostname other containers use to reach it
- `--network my-network` → joins the custom network
- `-p 27018:27017` → exposes MongoDB to host on port 27018 (avoids conflict with local MongoDB)

### Step 3 — Build the Node.js image
```bash
docker build -t my-webapp .
```

### Step 4 — Run the Node.js app on the same network
```bash
docker run -d --name appcontainer --network my-network -p 3000:3000 my-webapp
```
- `--name appcontainer` → container name
- `--network my-network` → must be same network as mongo
- `-p 3000:3000` → exposes app to your browser

### Step 5 — Verify both containers are running
```bash
docker ps
```
You should see both `mongo` and `appcontainer` listed.

### Step 6 — Verify both are on the same network
```bash
docker network inspect my-network
```
Look for the `"Containers"` section — both `mongo` and `appcontainer` should be listed.

### Step 7 — Open the app
```
http://localhost:3000
```
Type a message and click Save. It gets stored in MongoDB.

### Step 8 — View data in MongoDB Compass
Add a new connection in Compass:
```
mongodb://localhost:27018
```
Navigate to: `mydb` → `messages` collection

---

## Useful Commands

### View container logs
```bash
docker logs appcontainer
```
Should show:
```
✅ Connected to MongoDB
🚀 App running on http://localhost:3000
```

### Go inside a container
```bash
docker exec -it appcontainer sh
docker exec -it mongo mongosh
```

### Check data directly in MongoDB
```bash
docker exec -it mongo mongosh
use mydb
db.messages.find()
```

### Connect a running container to a network
```bash
docker network connect my-network appcontainer
```

### List all networks
```bash
docker network ls
```

---

## Cleanup

Stop and remove containers:
```bash
docker stop appcontainer mongo
docker rm appcontainer mongo
```

Remove the network:
```bash
docker network rm my-network
```

Remove the image:
```bash
docker rmi my-webapp
```

---

## Issues Faced & Fixes

### ❌ `getaddrinfo ENOTFOUND mongo`
**Cause:** The webapp container was not on `my-network`, so Docker DNS couldn't resolve the name `mongo`.

**Fix:**
```bash
docker network connect my-network appcontainer
docker restart appcontainer
```

---

### ❌ Data not showing in MongoDB Compass
**Cause:** Local MongoDB was already running on port `27017`, so Compass was connecting to the local install instead of the Docker container.

**Fix:** Re-run the mongo container mapped to port `27018` instead:
```bash
docker stop mongo
docker rm mongo
docker run -d --name mongo --network my-network -p 27018:27017 mongo:7
```
Then connect Compass to `mongodb://localhost:27018`

---

## Key Concepts

| Concept | Explanation |
|---|---|
| Custom network | Isolated network where containers can communicate |
| Container name as hostname | Docker DNS resolves `mongo` to the container's internal IP automatically |
| `-p host:container` | Maps a container port to your host machine |
| No `-p` on internal services | Keeps the service only accessible inside the network (more secure) |
| `docker network connect` | Attaches a running container to a network without recreating it |

---

## Next Steps to Explore

- **Volumes** — persist MongoDB data even if the container is deleted
- **Environment variables** — pass MongoDB URL dynamically using `-e` flag
- **Docker Compose** — define all containers, networks, and volumes in one `docker-compose.yml` file
