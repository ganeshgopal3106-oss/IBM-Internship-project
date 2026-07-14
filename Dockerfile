FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the React app
RUN npm run build

# Expose the default Render Web Service port
EXPOSE 10000
ENV PORT=10000

# Start the Node/Express proxy server
CMD ["node", "server.js"]
