# Build stage for frontend and backend
FROM node:20-alpine AS builder

# Install build tools for better-sqlite3 (python3, make, g++)
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build:all

# Production stage
FROM node:20-alpine

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache sqlite-libs

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./

# Copy node_modules with compiled native modules
COPY --from=builder /app/node_modules ./node_modules

# Create data directory for SQLite
RUN mkdir -p /data

# Environment
ENV NODE_ENV=production
ENV PORT=10000
ENV RENDER_DISK_MOUNT_PATH=/data

EXPOSE 10000

CMD ["node", "api/dist/server.js"]
