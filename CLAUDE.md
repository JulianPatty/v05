# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Sim Studio** (also known as SETN), a visual AI agent workflow builder built with Next.js. The application allows users to create, deploy, and manage AI workflows using a drag-and-drop canvas interface similar to Figma.

## Development Commands

### Running the Application

```bash
# Development mode with Turbopack on port 3000 (recommended)
cd src && bun run dev

# Development mode with classic Next.js (no Turbopack)
cd src && bun run dev:classic

# Run socket server separately
cd src && bun run dev:sockets

# Run both Next.js and Socket server together (recommended for full functionality)
cd src && bun run dev:full
```

### Database Commands

```bash
# Generate database migrations
cd src && bun run db:generate

# Push schema changes to database
cd src && bun run db:push

# Open Drizzle Studio for database management
cd src && bun run db:studio

# Run database migrations
cd src && bun run db:migrate
```

### Testing

```bash
cd src && bun run test              # Run tests once
cd src && bun run test:watch        # Run tests in watch mode
cd src && bun run test:coverage     # Run tests with coverage report
cd src && bun run test:billing:suite # Run billing test suite
```

### Build and Type Checking

```bash
cd src && bun run build            # Build for production with Turbopack
cd src && bun run start            # Start production server
cd src && bun run type-check       # Run TypeScript type checking
```

### Email Development

```bash
cd src && bun run email:dev        # Develop email templates
```

## Architecture Overview

### Tech Stack
- **Runtime**: Bun (requires v1.2.13+)
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth with multiple OAuth providers
- **Realtime**: Socket.IO for collaborative features
- **UI**: Shadcn/ui components with Tailwind CSS
- **State**: Zustand for state management
- **Workflow Editor**: ReactFlow for visual canvas

### Key Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── workspace/         # Main workspace UI
│   └── chat/              # Chat interface
├── blocks/                # Workflow block definitions
├── executor/              # Workflow execution engine
├── tools/                 # Tool implementations (API integrations)
├── stores/                # Zustand state stores
├── lib/                   # Shared utilities and services
├── db/                    # Database schema and migrations
└── socket-server/         # Real-time collaboration server
```

### Core Concepts

1. **Blocks**: Building blocks for workflows (defined in `src/blocks/`)
   - Each block has a type, inputs, outputs, and execution logic
   - Blocks are categorized as either 'blocks' or 'tools'

2. **Executor**: The engine that runs workflows (in `src/executor/`)
   - Handles block execution, routing, conditions, and parallel processing
   - Supports streaming responses and real-time updates

3. **Tools**: External service integrations (in `src/tools/`)
   - Each tool implements specific API integrations (Gmail, Slack, etc.)
   - Tools are invoked by blocks during workflow execution

4. **Stores**: Client-side state management (in `src/stores/`)
   - Workflow state, execution state, UI state, etc.
   - Uses Zustand for reactive state management

### Environment Configuration

Key environment variables needed:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Authentication secret
- `BETTER_AUTH_URL`: Base URL for auth
- `NEXT_PUBLIC_APP_URL`: Public app URL
- `NEXT_PUBLIC_SOCKET_URL`: Socket server URL for real-time features

OAuth providers (optional):
- Google, Microsoft, Discord, Slack, Linear, Notion, etc.
- Each requires client ID and secret

### Database Schema

The application uses Drizzle ORM with PostgreSQL. Key tables:
- `user`: User accounts
- `workflow`: Workflow definitions
- `organization`: Team organizations
- `workspace`: Workspaces for organizing workflows
- `subscription`: Billing subscriptions

### Authentication

Uses Better Auth with support for:
- Email/password with OTP verification
- Multiple OAuth providers
- Organization/team management
- Role-based access control

### Real-time Features

The socket server (`src/socket-server/`) handles:
- Collaborative workflow editing
- Real-time execution updates
- Presence indicators
- Workflow state synchronization

## Development Tips

1. **Always run both servers**: Use `bun run dev:full` to start both Next.js and Socket.IO servers for full functionality

2. **Database changes**: After modifying schema in `src/db/schema.ts`:
   - Run `bun run db:generate` to create migrations
   - Run `bun run db:push` to apply changes

3. **Type safety**: The project uses TypeScript extensively. Run `bun run type-check` before committing

4. **Testing**: Write tests for new features, especially in the executor and tools

5. **OAuth setup**: Most OAuth providers are optional. The app works without them but with limited functionality