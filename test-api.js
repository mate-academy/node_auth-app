import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 404 handler
    console.log('1. Testing 404 handler...');
    const notFound = await fetch(`${BASE_URL}/nonexistent`);
    console.log(`   Status: ${notFound.status} - ${notFound.statusText}`);
    
    // Test registration endpoint (without database)
    console.log('\n2. Testing registration endpoint...');
    const registration = await fetch(`${BASE_URL}/auth/registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    });
    console.log(`   Status: ${registration.status} - ${registration.statusText}`);
    
    console.log('\n✅ API server is responding!');
    console.log('Note: Database operations will fail without proper setup.');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nMake sure the server is running with: npm run dev');
  }
}

testAPI(); 