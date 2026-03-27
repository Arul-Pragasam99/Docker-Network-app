FROM node:18-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --omit=dev

# Copy app source
COPY app.js .

# Expose the app port
EXPOSE 3000

CMD ["node", "app.js"]
