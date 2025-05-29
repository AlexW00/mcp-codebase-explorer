# Use Node.js LTS version
FROM node:20-alpine

# Install additional tools for file operations
RUN apk add --no-cache findutils

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm ci --only=production

# Create directory for mounted codebase
RUN mkdir -p /workspace

# Set the default working directory to the mounted workspace
WORKDIR /workspace

# Expose the application
EXPOSE 3000

# Set environment variable for the base directory
ENV MCP_BASE_DIR=/workspace

# Start the server
CMD ["node", "/app/dist/server.js"]
