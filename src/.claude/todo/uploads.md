# Uploads Module Documentation

## Overview

The uploads module provides a unified abstraction layer for file storage in Sim Studio, supporting multiple storage providers (Azure Blob Storage, AWS S3, and local filesystem) with automatic failover and consistent APIs.

## Architecture

### Module Structure

```
src/lib/uploads/
├── index.ts                 # Main exports
├── storage-client.ts        # Unified storage abstraction
├── setup.ts                 # Configuration and initialization
├── setup.server.ts          # Server-side initialization
├── blob/                    # Azure Blob Storage implementation
│   ├── index.ts
│   ├── blob-client.ts
│   └── blob-client.test.ts
└── s3/                      # AWS S3 implementation
    ├── index.ts
    ├── s3-client.ts
    └── s3-client.test.ts
```

### Storage Provider Priority

The system automatically selects storage providers based on available credentials:

1. **Azure Blob Storage** (highest priority)
2. **AWS S3** (if Azure not configured)
3. **Local Filesystem** (fallback)

## Core Components

### 1. Storage Client (`storage-client.ts`)

The main abstraction layer that routes operations to the appropriate storage provider.

#### Key Functions

- **`uploadFile()`** - Upload files to configured storage
- **`downloadFile()`** - Retrieve files from storage
- **`deleteFile()`** - Remove files from storage
- **`getPresignedUrl()`** - Generate temporary access URLs
- **`getStorageProvider()`** - Get current storage provider
- **`isUsingCloudStorage()`** - Check if using cloud storage

#### Usage Example

```typescript
import { uploadFile, downloadFile, getPresignedUrl } from '@/lib/uploads'

// Upload a file
const fileInfo = await uploadFile(
  buffer,
  'document.pdf',
  'application/pdf'
)

// Download a file
const data = await downloadFile(fileInfo.key)

// Generate presigned URL (1 hour expiry)
const url = await getPresignedUrl(fileInfo.key, 3600)
```

### 2. Configuration (`setup.ts`)

Manages storage provider configuration and credentials.

#### Environment Variables

**Azure Blob Storage:**
- `AZURE_STORAGE_CONNECTION_STRING` - Full connection string (preferred)
- OR `AZURE_ACCOUNT_NAME` + `AZURE_ACCOUNT_KEY` - Account credentials
- `AZURE_STORAGE_CONTAINER_NAME` - Main storage container
- `AZURE_STORAGE_KB_CONTAINER_NAME` - Knowledge base container

**AWS S3:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `S3_BUCKET_NAME` - Main storage bucket
- `S3_KB_BUCKET_NAME` - Knowledge base bucket

**Local Storage:**
- No configuration needed
- Files stored in `./uploads` directory

#### Configuration Objects

```typescript
// Main storage configs
S3_CONFIG = {
  bucket: string,
  region: string
}

BLOB_CONFIG = {
  accountName: string,
  accountKey: string,
  connectionString: string,
  containerName: string
}

// Knowledge base storage configs
S3_KB_CONFIG = { ... }
BLOB_KB_CONFIG = { ... }
```

### 3. Provider Implementations

#### Azure Blob Storage (`blob/blob-client.ts`)

- Uses `@azure/storage-blob` SDK
- Supports connection string or account key authentication
- Generates SAS tokens for presigned URLs
- Singleton pattern for client reuse

#### AWS S3 (`s3/s3-client.ts`)

- Uses AWS SDK v3 (`@aws-sdk/client-s3`)
- Supports explicit credentials or IAM roles
- Uses AWS Signature V4 for presigned URLs
- Automatic credential chain support

### 4. Server Initialization (`setup.server.ts`)

- Runs on server startup
- Validates credentials and configuration
- Logs storage provider selection
- Creates local upload directory if needed

## File Information Structure

All storage providers return a consistent `FileInfo` object:

```typescript
interface FileInfo {
  path: string    // API serve path (e.g., "/api/files/serve/s3/...")
  key: string     // Storage key/identifier
  name: string    // Original filename
  size: number    // File size in bytes
  type: string    // MIME type
}
```

## API Integration

Files are served through unified API endpoints:
- `/api/files/serve/blob/[key]` - Azure Blob files
- `/api/files/serve/s3/[key]` - S3 files
- `/api/files/serve/[key]` - Local files

## Features

### 1. Automatic Provider Selection
- Detects available credentials at startup
- Falls back gracefully between providers
- No code changes needed to switch providers

### 2. Unified Interface
- Same API regardless of storage backend
- Consistent error handling
- Type-safe operations

### 3. Security
- Presigned URLs for temporary access
- No direct credential exposure
- Metadata sanitization for HTTP headers

### 4. Performance
- Singleton clients for connection reuse
- Stream-based operations for large files
- Efficient buffer handling

### 5. Flexibility
- Support for custom storage configurations
- Separate configs for main and knowledge base storage
- Provider-specific features accessible when needed

## Testing

Each provider includes comprehensive unit tests:
- Upload/download operations
- Presigned URL generation
- Error handling
- Filename sanitization

## Best Practices

1. **Environment Configuration**
   - Use connection strings when available (Azure)
   - Prefer IAM roles over explicit credentials (AWS)
   - Set all required variables for chosen provider

2. **Error Handling**
   - Always wrap storage operations in try-catch
   - Check for provider availability before operations
   - Handle network timeouts gracefully

3. **File Naming**
   - System adds timestamps to prevent collisions
   - Original filenames preserved in metadata
   - Special characters automatically sanitized

4. **Security**
   - Use presigned URLs for client access
   - Set appropriate expiration times
   - Never expose storage credentials

## Integration with Sim Studio

The uploads module is used throughout Sim Studio for:
- Workflow file attachments
- Knowledge base document storage
- AI agent file processing
- User-uploaded content
- Temporary file handling

This modular design allows Sim Studio to:
- Deploy on any cloud provider
- Support hybrid deployments
- Scale storage independently
- Maintain consistent file handling across features