# OpenTelemetry Setup Guide

This guide explains how to use OpenTelemetry in the SetNStudio application for observability and monitoring.

## Overview

OpenTelemetry is integrated into the application to provide:
- Distributed tracing
- Performance monitoring
- Error tracking
- Custom metrics

## Environment Variables

Add these variables to your `.env.local` file:

```env
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=setnstudio
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_HEADERS={}

# Optional: Configure sampling (0.0 to 1.0)
OTEL_TRACES_SAMPLER=always_on
OTEL_TRACES_SAMPLER_ARG=1.0
```

## Running Jaeger Locally

1. Start Jaeger using Docker Compose:
```bash
docker compose -f docker-compose.otel.yml up -d jaeger
```

2. Access the Jaeger UI at: http://localhost:16686

3. Your application will automatically send traces to Jaeger.

## Usage Examples

### Server-Side Tracing (API Routes)

```typescript
import { traceAPIRoute } from '@/lib/otel/server-tracer'

export async function GET(request: NextRequest) {
  return traceAPIRoute('api.users.list', async () => {
    // Your API logic here
    const users = await fetchUsers()
    return NextResponse.json(users)
  })
}
```

### Server Actions

```typescript
import { traceServerAction } from '@/lib/otel/server-tracer'

export async function createUser(data: UserData) {
  return traceServerAction('create_user', async () => {
    // Your server action logic
    return await db.user.create({ data })
  }, {
    'user.email': data.email,
    'user.role': data.role,
  })
}
```

### Database Operations

```typescript
import { traceDatabase } from '@/lib/otel/server-tracer'

export async function getUserById(id: string) {
  return traceDatabase('user.findById', async () => {
    return await db.user.findUnique({ where: { id } })
  }, {
    'db.table': 'users',
    'db.operation': 'findUnique',
    'user.id': id,
  })
}
```

### Client-Side Tracing

```typescript
import { traceAsync, addSpanEvent } from '@/lib/otel/client-tracer'

// In a React component
const fetchData = async () => {
  return traceAsync('fetch_dashboard_data', async () => {
    addSpanEvent('fetch_started')
    
    const response = await fetch('/api/dashboard')
    const data = await response.json()
    
    addSpanEvent('fetch_completed', {
      itemCount: data.length,
    })
    
    return data
  })
}
```

## Viewing Traces

1. Open Jaeger UI: http://localhost:16686
2. Select "setnstudio" from the Service dropdown
3. Click "Find Traces"
4. Click on any trace to see the detailed breakdown

## Advanced Setup

### Using OpenTelemetry Collector

For production environments, use the OpenTelemetry Collector:

```bash
docker compose -f docker-compose.otel.yml up -d otel-collector
```

Then update your endpoint:
```env
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
```

### Adding Prometheus Metrics

```bash
docker compose -f docker-compose.otel.yml up -d prometheus
```

Access Prometheus at: http://localhost:9090

### Grafana Dashboards

```bash
docker compose -f docker-compose.otel.yml up -d grafana
```

Access Grafana at: http://localhost:3000 (admin/admin)

## Best Practices

1. **Span Naming**: Use descriptive, hierarchical names
   - `api.users.create`
   - `db.users.insert`
   - `cache.users.get`

2. **Attributes**: Add relevant context
   - User IDs
   - Request IDs
   - Error details
   - Business metrics

3. **Sampling**: In production, consider sampling to reduce overhead
   ```env
   OTEL_TRACES_SAMPLER=traceidratio
   OTEL_TRACES_SAMPLER_ARG=0.1  # Sample 10% of traces
   ```

4. **Error Handling**: Always record exceptions in spans
   ```typescript
   span.recordException(error)
   span.setStatus({ code: SpanStatusCode.ERROR })
   ```

## Troubleshooting

1. **No traces appearing**: Check that Jaeger is running and accessible
2. **Missing spans**: Ensure instrumentation.ts is being loaded
3. **Performance impact**: Adjust sampling rate if needed

## Security Considerations

1. **Sensitive Data**: Never include passwords, tokens, or PII in span attributes
2. **Headers**: Be cautious with OTEL_EXPORTER_OTLP_HEADERS in production
3. **Network**: Use TLS for production endpoints