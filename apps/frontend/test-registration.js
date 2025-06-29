// Test registration API
async function testRegistration() {
  console.log('🧪 Testing Registration API...\n')

  const testUser = {
    email: 'testuser@example.com',
    username: 'TestCaptain',
    password: 'testpassword123'
  }

  try {
    const response = await fetch('http://localhost:3002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const data = await response.json()

    console.log('Status:', response.status)
    console.log('Response:', data)

    if (response.ok) {
      console.log('✅ Registration successful!')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
      console.log('Username:', data.user.username)
    } else {
      console.log('❌ Registration failed:', data.error)
    }

  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

testRegistration()
