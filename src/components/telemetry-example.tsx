'use client'

import { useState } from 'react'
import { traceAsync, addSpanEvent } from '@/lib/otel/trace-utils'

export function TelemetryExample() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  const handleClick = async () => {
    setLoading(true)
    
    try {
      // Trace the entire operation
      const response = await traceAsync(
        'fetch_telemetry_data',
        async () => {
          // Add event when starting
          addSpanEvent('fetch_started', {
            endpoint: '/api/telemetry-example',
          })
          
          const res = await fetch('/api/telemetry-example')
          const data = await res.json()
          
          // Add event when completed
          addSpanEvent('fetch_completed', {
            status: res.status,
            success: res.ok,
          })
          
          return data
        },
        {
          'component': 'TelemetryExample',
          'action': 'button_click',
        }
      )
      
      setResult(response.message)
    } catch (error) {
      console.error('Error fetching telemetry data:', error)
      setResult('Error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">OpenTelemetry Example</h3>
      
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test Telemetry'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">{result}</p>
        </div>
      )}
    </div>
  )
}