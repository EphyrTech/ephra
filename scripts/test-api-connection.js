#!/usr/bin/env node

/**
 * Test script to verify API connection and basic endpoints
 * Run this to ensure the ephra-fastapi backend is working correctly
 */

const API_BASE_URL = 'http://localhost:8000/v1';

async function testEndpoint(method, endpoint, data = null, token = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`${method} ${endpoint}`);
    const response = await fetch(url, config);
    const responseData = await response.text();
    
    if (response.ok) {
      console.log(`✅ ${response.status} - Success`);
      if (responseData) {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        } catch {
          console.log('Response:', responseData);
        }
      }
    } else {
      console.log(`❌ ${response.status} - ${response.statusText}`);
      console.log('Error:', responseData);
    }
    
    return response.ok ? JSON.parse(responseData || '{}') : null;
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
    return null;
  }
}

async function testApiConnection() {
  console.log('🔍 Testing API Connection');
  console.log('='.repeat(50));
  
  // Test 1: Health check
  console.log('\n1. Health Check');
  await testEndpoint('GET', '/health');
  
  // Test 2: API docs
  console.log('\n2. API Documentation');
  await testEndpoint('GET', '/docs');
  
  // Test 3: Unauthenticated endpoint (should fail)
  console.log('\n3. Protected Endpoint (should fail)');
  await testEndpoint('GET', '/users/me');
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 API Connection Test Complete');
  console.log('\n💡 Next Steps:');
  console.log('1. If health check failed, ensure ephra-fastapi is running');
  console.log('2. Start backend: cd ../ephra-fastapi && docker compose up -d');
  console.log('3. Check API docs at: http://localhost:8000/docs');
  console.log('4. Run full test: npm run test:api');
}

async function testAuthFlow() {
  console.log('\n🔐 Testing Authentication Flow');
  console.log('='.repeat(50));
  
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  };
  
  // Test registration
  console.log('\n1. User Registration');
  const registerResult = await testEndpoint('POST', '/auth/register', testUser);
  
  if (registerResult) {
    // Test login
    console.log('\n2. User Login');
    const loginResult = await testEndpoint('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResult && loginResult.access_token) {
      const token = loginResult.access_token;
      
      // Test protected endpoint
      console.log('\n3. Get Current User');
      await testEndpoint('GET', '/users/me', null, token);
      
      // Test journal creation
      console.log('\n4. Create Journal Entry');
      await testEndpoint('POST', '/journals/', {
        title: 'Test Journal Entry',
        content: 'This is a test journal entry.',
        mood: 'good'
      }, token);
    }
  }
}

async function main() {
  await testApiConnection();
  
  // Ask if user wants to test auth flow
  console.log('\n❓ Test authentication flow? (This will create test data)');
  console.log('Press Ctrl+C to skip, or wait 5 seconds to continue...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  await testAuthFlow();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted by user');
  process.exit(0);
});

main().catch(console.error);
