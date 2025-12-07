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

# Create db directory (db fetched at runtime)
RUN mkdir -p db

# Expose port
ENV PORT=3000
EXPOSE 3000

# Fetch db at startup, then run server
CMD ["sh", "-c", "./scripts/fetch-db.sh && npm run start:http"]
