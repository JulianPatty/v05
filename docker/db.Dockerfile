# ========================================
# Migration Runner Dockerfile
# ========================================
FROM oven/bun:alpine AS runner
WORKDIR /app

# Install dependencies needed for migrations
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json bun.lock ./
COPY src/package.json ./src/

# Install dependencies
RUN bun install

# Copy migration-related files
COPY src/drizzle.config.ts ./src/
COPY src/db ./src/db
COPY src/lib/env.ts ./src/lib/

# Set working directory to src for migration commands
WORKDIR /app/src

# Default command is to run migrations
CMD ["bun", "run", "db:migrate"]