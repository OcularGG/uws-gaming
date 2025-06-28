// Test utility to verify port data loading
import { getPortList, searchPortsSync } from '@/data/ports'

export const testPortData = async () => {
  try {
    console.log('Testing port data loading...')
    
    // Test loading port data
    const ports = await getPortList()
    console.log(`Loaded ${ports.length} ports`)
    console.log('First 10 ports:', ports.slice(0, 10))
    
    // Test search functionality
    const searchResults = searchPortsSync('hav')
    console.log('Search results for "hav":', searchResults)
    
    return { success: true, portCount: ports.length }
  } catch (error) {
    console.error('Error loading port data:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Run test if in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  testPortData().then(result => {
    console.log('Port data test result:', result)
  })
}
