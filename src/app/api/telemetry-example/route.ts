import { NextRequest, NextResponse } from 'next/server'
import { traceAPIRoute } from '@/lib/otel/trace-utils'
import { trace } from '@opentelemetry/api'

// Example API route with OpenTelemetry tracing
export async function GET(request: NextRequest) {
  return traceAPIRoute('telemetry-example', async () => {
    const span = trace.getActiveSpan()
    
    // Add custom attributes to the span
    span?.setAttributes({
      'user.id': request.headers.get('x-user-id') || 'anonymous',
      'api.version': '1.0',
    })
    
    // Simulate some work
    await simulateWork()
    
    // Add an event to track progress
    span?.addEvent('work_completed', {
      duration_ms: 100,
    })
    
    return NextResponse.json({
      message: 'Telemetry example completed',
      timestamp: new Date().toISOString(),
    })
  })
}

async function simulateWork() {
  // Create a child span for nested operations
  const tracer = trace.getTracer('telemetry-example')
  const span = tracer.startSpan('simulate_work')
  
  try {
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, 100))
    
    span.setAttributes({
      'work.type': 'simulation',
      'work.duration_ms': 100,
    })
    
    span.setStatus({ code: 1 }) // OK
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({ code: 2, message: 'Work failed' }) // ERROR
    throw error
  } finally {
    span.end()
  }
}