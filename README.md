# Docker Network Demo 🐳

A Node.js + MongoDB app demonstrating **Docker custom networking with internal DNS resolution**.

Containers communicate using **service names (container names)** instead of IPs — exactly how real microservices work.

---

## Project Structure

```
docker-network-demo/
├── app.js
├── package.json
├── Dockerfile
└── .dockerignore
```

---

## Architecture Overview

```
Browser → http://localhost:3000
              ↓
        [appcontainer]  (Node.js)
              │
              │  my-network (user-defined bridge)
              │
        [mongo] (MongoDB)
```

---

## Core Networking Concept

- Both containers are attached to **`my-network`**
- Docker provides **built-in DNS** in user-defined networks
- The app connects using:
  ```
  mongodb://mongo:27017
  ```
- No IP addresses needed

---

## Prerequisites

- Docker installed and running
- MongoDB Compass (optional)

---

## Step-by-Step Setup

### 1. Create a custom network
```bash
docker network create my-network
```

---

### 2. Run MongoDB container
```bash
docker run -d \
  --name mongo \
  --network my-network \
  -p 27018:27017 \
  mongo:7
```

**Why:**
- `mongo` → becomes hostname inside network
- `my-network` → enables DNS resolution
- `27018` → avoids conflict with local MongoDB

---

### 3. Build Node.js image
```bash
docker build -t my-webapp .
```

---

### 4. Run Node.js container
```bash
docker run -d \
  --name appcontainer \
  --network my-network \
  -p 3000:3000 \
  my-webapp
```

---

### 5. Verify containers
```bash
docker ps
```

---

### 6. Verify network connection
```bash
docker network inspect my-network
```

Both `mongo` and `appcontainer` must appear under `"Containers"`

---

### 7. Run the app
```
http://localhost:3000
```

---

### 8. View data in MongoDB Compass
```
mongodb://localhost:27018
```

Navigate:
```
mydb → messages
```

---

## Internal Communication Flow

Inside container:
```
appcontainer → mongo:27017
```

Outside (host):
```
localhost:27018 → mongo container
localhost:3000 → appcontainer
```

---

## Important Networking Rules

| Scenario | Works? | Reason |
|--------|------|--------|
| App → Mongo using `mongo` | ✔ | Docker DNS |
| App → Mongo using `localhost` | ❌ | Localhost = same container |
| Containers in same network | ✔ | Shared network |
| Containers in different networks | ❌ | Isolated |

---

## docker network connect (Dynamic Attach)

If container is already running:

```bash
docker network connect my-network appcontainer
```

Then restart:
```bash
docker restart appcontainer
```

---

## Useful Commands

### View logs
```bash
docker logs appcontainer
```

---

### Enter containers
```bash
docker exec -it appcontainer sh
docker exec -it mongo mongosh
```

---

### Check MongoDB data
```bash
docker exec -it mongo mongosh
use mydb
db.messages.find()
```

---

### List networks
```bash
docker network ls
```

---

### Inspect container networking
```bash
docker inspect appcontainer
```

---

## Common Issues & Fixes

---

### ❌ getaddrinfo ENOTFOUND mongo

**Cause:**  
Container not connected to `my-network`

**Fix:**
```bash
docker network connect my-network appcontainer
docker restart appcontainer
```

---

### ❌ MongoDB connection refused (ECONNREFUSED)

**Cause:**  
Wrong port or MongoDB not ready

**Fix:**
- Ensure connection string:
  ```
  mongodb://mongo:27017
  ```
- Check logs:
  ```bash
  docker logs mongo
  ```

---

### ❌ Data not visible in MongoDB Compass

**Cause:**  
Connected to local MongoDB instead of container

**Fix:**
```
mongodb://localhost:27018
```

---

## Best Practices

- Always use **custom networks**
- Never hardcode IPs
- Use container names as hostnames
- Expose only required ports
- Avoid exposing database ports in production

---

## Cleanup

```bash
docker stop appcontainer mongo
docker rm appcontainer mongo
docker network rm my-network
docker rmi my-webapp
```

---

## What You Learned

- Docker DNS-based service discovery
- Container-to-container communication
- Host vs container networking
- Dynamic network attachment using `docker network connect`

---

## Next Steps

- Volumes → persist MongoDB data
- Environment variables → dynamic configuration
- Docker Compose → manage everything in one file
