FROM node:20-slim

WORKDIR /app

# Install dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Fetch the database from upstream release
RUN ./scripts/fetch-db.sh

# Expose port
ENV PORT=3000
EXPOSE 3000

# Run HTTP server
CMD ["npm", "run", "start:http"]
