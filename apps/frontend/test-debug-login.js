// Test debug login API
async function testDebugLogin() {
  console.log('🧪 Testing Debug Login API...\n')

  const credentials = {
    emailOrUsername: 'admin@krakengaming.org',
    password: 'admin123'
  }

  try {
    const response = await fetch('http://localhost:3002/api/debug/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const data = await response.json()

    console.log('Status:', response.status)
    console.log('Response:', data)

    if (response.ok) {
      console.log('✅ Debug login successful!')
    } else {
      console.log('❌ Debug login failed:', data.error)
    }

  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

testDebugLogin()
