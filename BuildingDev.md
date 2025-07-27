# Building for Development

This document contains instructions for building the React Flow demo project.

## Build Issues & Solutions

### Problem: Webpack Build Failures
The standard `next build` command fails with webpack errors:
```
TypeError: _webpack.WebpackError is not a constructor
```

### Solution: Use Turbopack
Use Turbopack instead of webpack for building:

```bash
# For production build
cd src && npx next build --turbopack

# For development
bun run dev  # (already uses --turbopack flag)
```

## Build Commands

### Development Server
```bash
bun run dev
```
- Runs on http://localhost:3002
- Uses Turbopack automatically
- Hot reload enabled

### Production Build
```bash
# Navigate to src directory first
cd src && npx next build --turbopack
```

### Alternative: Use bun script
```bash
# From project root - but modify package.json build script to include --turbopack
bun run build
```

## Build Warnings to Address

### 1. Multiple Lockfiles
Clean up conflicting lockfiles:
- Keep: `bun.lock` (main)
- Remove: `package-lock.json`, extra `bun.lock` files

### 2. Better Auth Configuration
Set environment variables:
```bash
# Add to .env.local
BETTER_AUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Prettier Version Conflicts
Consider updating prettier to resolve version mismatches between dependencies.

## Important Notes

- **Turbopack is experimental** - not recommended for production deployments
- Turbopack builds include source maps by default
- Bundle sizes may differ from webpack builds
- Clear `.next` directory when switching between webpack and Turbopack

## Build Output
Successful Turbopack build generates:
- 49 static pages
- ~162kB first load JS
- Server-side rendered pages marked with ƒ symbol