export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Check if we should use the existing instrumentation-server.ts or the new OpenTelemetry setup
    const existingInstrumentation = await import('./instrumentation-server')
    
    // The existing instrumentation already handles OpenTelemetry setup
    if (existingInstrumentation.register) {
      await existingInstrumentation.register()
    }
  }
}