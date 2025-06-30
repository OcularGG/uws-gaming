// Test authentication API
const testAuth = async () => {
  try {
    console.log('Testing authentication...');

    // Test user credentials
    const userCredentials = {
      emailOrUsername: 'user@uwsgaming.org',
      password: 'user123'
    };

    // Test admin credentials
    const adminCredentials = {
      emailOrUsername: 'admin@uwsgaming.org',
      password: 'KG_Admin_2025_de3e3b4e87c10f6e775b6bdcad274ced'
    };

    console.log('User credentials:', userCredentials);
    console.log('Admin credentials:', adminCredentials);

    // Test signin endpoint directly
    const response = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        emailOrUsername: userCredentials.emailOrUsername,
        password: userCredentials.password,
        callbackUrl: 'http://localhost:3000/dashboard'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Error testing auth:', error);
  }
};

testAuth();
