/**
 * OpenTelemetry tracing utilities that work with the existing instrumentation setup
 */
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api'

// Server-side tracing utilities
export function startServerSpan<T>(
  name: string,
  fn: () => T | Promise<T>,
  options?: {
    attributes?: Record<string, any>
    kind?: SpanKind
  }
): T | Promise<T> {
  const tracer = trace.getTracer('sim-studio', '0.1.0')
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
        'api.version': '1.0',
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

// Client-side tracing utilities
export function startClientSpan<T>(
  name: string,
  fn: () => T | Promise<T>,
  attributes?: Record<string, any>
): T | Promise<T> {
  const tracer = trace.getTracer('sim-studio-client', '0.1.0')
  const span = tracer.startSpan(name, { 
    kind: SpanKind.CLIENT,
    attributes 
  })
  
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
  return startClientSpan(name, fn, attributes) as Promise<T>
}

// Wrapper for sync operations with automatic span management
export function traceSync<T>(
  name: string,
  fn: () => T,
  attributes?: Record<string, any>
): T {
  return startClientSpan(name, fn, attributes) as T
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