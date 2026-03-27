FROM node:18-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose the app port
EXPOSE 3000

CMD ["node", "app.js"]
