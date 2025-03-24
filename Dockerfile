# Stage 1: Build the React app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json first (and package-lock.json if it exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the container
COPY . .

# Build the Vite app
RUN npm run build

CMD ["npm", "run", "start"]
