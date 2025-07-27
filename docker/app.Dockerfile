# ========================================
# IMPORTANT: This Dockerfile builds ONLY the src directory
# It uses src/package.json for dependencies, not the root package.json
# ========================================

# ========================================
# Base Stage: Alpine Linux with Bun
# ========================================
FROM oven/bun:alpine AS base

# ========================================
# Dependencies Stage: Install Dependencies
# ========================================
FROM oven/bun:alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /src

# Install turbo globally
RUN bun install -g turbo

# Copy only the src/package.json file
# NOTE: We are only using the src/package.json for this build
COPY src/package.json ./

# Install dependencies from src/package.json only
RUN bun install --omit dev  --ignore-scripts

# ========================================
# Builder Stage: Build the Application
# ========================================
FROM base AS builder
WORKDIR /src

# Copy dependencies from deps stage
COPY --from=deps /src/node_modules ./node_modules

# Copy only src directory contents
COPY . .
# Installing with full context to prevent missing dependencies error
RUN bun install --omit dev --ignore-scripts
# Copy necessary config files from src
# Note: globals.css expects tailwind.config.ts to be 2 levels up from app/
WORKDIR /src

# Install sharp for Next.js image optimization
RUN bun install sharp --ignore-scripts

ENV DOCKER_BUILD=1

WORKDIR /src
RUN bun run build
# ======================================== # Final Stage: Run the Application
# ========================================
FROM base AS runner
WORKDIR /src

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /src/public ./public
COPY --from=builder /src/.next/standalone ./
COPY --from=builder /src/.next/static ./.next/static

EXPOSE 3002
ENV PORT=3002 \
    HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]