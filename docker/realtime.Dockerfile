# ========================================
# Base Stage: Alpine Linux with Bun
# ========================================
FROM oven/bun:alpine AS base

# ========================================
# Dependencies Stage: Install Dependencies
# ========================================
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo globally
RUN bun install -g turbo

# Copy package files
COPY package.json bun.lock ./
COPY src/package.json ./src/

# Install all dependencies
RUN bun install

# Install src dependencies
WORKDIR /app/src
RUN bun install
WORKDIR /app

# ========================================
# Builder Stage: Build the Application
# ========================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ========================================
# Runner Stage: Run the Socket Server
# ========================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the entire app since socket-server has dependencies on other modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/package.json ./src/package.json

# Expose socket server port (default 3002, but configurable via PORT env var)
EXPOSE 3002
ENV PORT=3002 \
    SOCKET_PORT=3002 \
    HOSTNAME="0.0.0.0"

# Run the socket server directly
CMD ["bun", "src/socket-server/index.ts"]