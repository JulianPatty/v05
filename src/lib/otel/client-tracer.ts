import { trace, context, SpanStatusCode } from '@opentelemetry/api'

// Get tracer instance for client-side tracing
const tracer = trace.getTracer('setnstudio-client', '1.0.0')

export function startSpan<T>(
  name: string,
  fn: () => T | Promise<T>,
  attributes?: Record<string, any>
): T | Promise<T> {
  const span = tracer.startSpan(name, { attributes })
  
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
}

// Wrapper for async operations with automatic span management
export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  return startSpan(name, fn, attributes) as Promise<T>
}

// Wrapper for sync operations with automatic span management
export function traceSync<T>(
  name: string,
  fn: () => T,
  attributes?: Record<string, any>
): T {
  return startSpan(name, fn, attributes) as T
}

// Add custom attributes to the current span
export function addSpanAttributes(attributes: Record<string, any>) {
  const span = trace.getActiveSpan()
  if (span) {
    span.setAttributes(attributes)
  }
}

// Add an event to the current span
export function addSpanEvent(name: string, attributes?: Record<string, any>) {
  const span = trace.getActiveSpan()
  if (span) {
    span.addEvent(name, attributes)
  }
}