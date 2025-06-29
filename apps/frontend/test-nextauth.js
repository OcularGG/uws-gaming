// Test NextAuth login directly
const testLogin = async () => {
  try {
    console.log('🧪 Testing NextAuth signIn...')

    const response = await fetch('http://localhost:3002/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: 'admin@krakengaming.org',
        password: 'admin123',
        redirect: false
      }),
    })

    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.text()
    console.log('Response:', data)

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testLogin()
