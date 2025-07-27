# CLAUDE.md - Project Guidelines

## Important Naming Convention
- Replace any instance of "Sim Studio" with "Setn Studio" throughout the codebase
- This applies to:
  - Comments
  - Documentation
  - Variable names
  - Service names
  - Configuration files
  - User-facing text

## OpenTelemetry Integration

The project has integrated OpenTelemetry for observability with the following setup:

### Configuration
- Main config: `src/telemetry.config.ts`
- Server instrumentation: `src/instrumentation-server.ts`
- Client instrumentation: `src/instrumentation-client.ts`
- Trace utilities: `src/lib/otel/trace-utils.ts`

### Usage Examples

#### Server-side tracing (API routes):
```typescript
import { traceAPIRoute } from '@/lib/otel/trace-utils'

export async function GET(request: NextRequest) {
  return traceAPIRoute('api.users.list', async () => {
    // Your API logic here
  })
}
```

#### Client-side tracing:
```typescript
import { traceAsync, addSpanEvent } from '@/lib/otel/trace-utils'

const fetchData = async () => {
  return traceAsync('fetch_data', async () => {
    addSpanEvent('fetch_started')
    const response = await fetch('/api/data')
    return response.json()
  })
}
```

### Environment Variables
Add to `.env.local`:
```
OTEL_SERVICE_NAME=setnstudio
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
```

### Running Jaeger
```bash
docker compose -f docker-compose.otel.yml up -d jaeger
```

Access Jaeger UI at: http://localhost:16686