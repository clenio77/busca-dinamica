# Use official Node.js LTS lightweight image
FROM node:18-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Install production dependencies first (for better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

# Expose the application port
EXPOSE 3000

# Set NODE_ENV explicitly
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]