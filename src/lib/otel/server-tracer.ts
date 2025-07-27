import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'
import { headers } from 'next/headers'

// Get tracer instance for server-side tracing
const tracer = trace.getTracer('setnstudio-server', '1.0.0')

export function startServerSpan<T>(
  name: string,
  fn: () => T | Promise<T>,
  options?: {
    attributes?: Record<string, any>
    kind?: SpanKind
  }
): T | Promise<T> {
  const span = tracer.startSpan(name, {
    kind: options?.kind || SpanKind.SERVER,
    attributes: options?.attributes,
  })
  
  // Set context for nested spans
  return context.with(trace.setSpan(context.active(), span), () => {
    try {
      const result = fn()
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            span.setStatus({ code: SpanStatusCode.OK })
            span.end()
            return value
          })
          .catch((error) => {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : String(error),
            })
            span.recordException(error instanceof Error ? error : new Error(String(error)))
            span.end()
            throw error
          })
      }
      
      span.setStatus({ code: SpanStatusCode.OK })
      span.end()
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      })
      span.recordException(error instanceof Error ? error : new Error(String(error)))
      span.end()
      throw error
    }
  })
}

// Trace API route handler
export function traceAPIRoute<T>(
  routeName: string,
  handler: () => Promise<T>
): Promise<T> {
  return startServerSpan(
    `api.${routeName}`,
    handler,
    {
      kind: SpanKind.SERVER,
      attributes: {
        'http.route': routeName,
        'http.method': getMethod(),
      },
    }
  ) as Promise<T>
}

// Trace server action
export function traceServerAction<T>(
  actionName: string,
  handler: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  return startServerSpan(
    `action.${actionName}`,
    handler,
    {
      kind: SpanKind.SERVER,
      attributes: {
        'action.name': actionName,
        ...attributes,
      },
    }
  ) as Promise<T>
}

// Trace database operations
export function traceDatabase<T>(
  operation: string,
  handler: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  return startServerSpan(
    `db.${operation}`,
    handler,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        'db.operation': operation,
        ...attributes,
      },
    }
  ) as Promise<T>
}

// Helper to get HTTP method from headers
function getMethod(): string {
  try {
    const headersList = headers()
    return headersList.get('x-invoke-method') || 'GET'
  } catch {
    return 'UNKNOWN'
  }
}