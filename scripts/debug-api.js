#!/usr/bin/env node

/**
 * Debug API Connection Script
 * 
 * This script helps debug API connection issues by testing different scenarios
 */

const API_BASE_URL = 'http://localhost:8000/v1';

async function testBasicConnection() {
  console.log('🔍 Testing basic API connection...');
  console.log(`Target URL: ${API_BASE_URL}/health`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`✅ Response status: ${response.status}`);
    console.log(`✅ Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log(`✅ Response body:`, data);
    
    return true;
  } catch (error) {
    console.error(`❌ Connection failed:`, error.message);
    return false;
  }
}

async function testWithTimeout() {
  console.log('\n🕐 Testing with timeout...');
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 5000);
  });
  
  try {
    const response = await Promise.race([
      fetch(`${API_BASE_URL}/health`),
      timeoutPromise
    ]);
    
    console.log(`✅ Request completed within timeout`);
    console.log(`✅ Status: ${response.status}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return false;
  }
}

async function testLoginEndpoint() {
  console.log('\n🔐 Testing login endpoint...');
  
  const loginData = {
    email: 'test@example.com',
    password: 'testpassword'
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    console.log(`✅ Login endpoint responded with status: ${response.status}`);
    
    const data = await response.text();
    console.log(`✅ Response:`, data);
    
    return true;
  } catch (error) {
    console.error(`❌ Login request failed:`, error.message);
    return false;
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'OPTIONS',
    });
    
    console.log(`✅ OPTIONS request status: ${response.status}`);
    console.log(`✅ CORS headers:`, {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });
    
    return true;
  } catch (error) {
    console.error(`❌ CORS test failed:`, error.message);
    return false;
  }
}

async function checkBackendStatus() {
  console.log('\n🏥 Checking backend health...');
  
  const endpoints = [
    '/health',
    '/docs',
    '/openapi.json'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 API Connection Debug Tool');
  console.log('=' .repeat(50));
  
  // Test 1: Basic connection
  const basicOk = await testBasicConnection();
  
  // Test 2: Timeout handling
  const timeoutOk = await testWithTimeout();
  
  // Test 3: Login endpoint
  const loginOk = await testLoginEndpoint();
  
  // Test 4: CORS
  const corsOk = await testCORS();
  
  // Test 5: Backend health
  await checkBackendStatus();
  
  console.log('\n📊 Summary:');
  console.log(`Basic Connection: ${basicOk ? '✅' : '❌'}`);
  console.log(`Timeout Handling: ${timeoutOk ? '✅' : '❌'}`);
  console.log(`Login Endpoint: ${loginOk ? '✅' : '❌'}`);
  console.log(`CORS: ${corsOk ? '✅' : '❌'}`);
  
  if (!basicOk) {
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Make sure the backend is running: docker compose up -d');
    console.log('2. Check if the backend is accessible: curl http://localhost:8000/v1/health');
    console.log('3. Verify the backend logs for errors');
    console.log('4. Check if port 8000 is available and not blocked');
  }
  
  if (basicOk && !timeoutOk) {
    console.log('\n🔧 Timeout Issues:');
    console.log('1. Backend might be slow to respond');
    console.log('2. Check backend performance and logs');
    console.log('3. Consider increasing timeout values');
  }
  
  if (basicOk && !corsOk) {
    console.log('\n🔧 CORS Issues:');
    console.log('1. Backend CORS configuration might be restrictive');
    console.log('2. Check backend CORS settings');
    console.log('3. Verify allowed origins include your frontend URL');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Debug interrupted by user');
  process.exit(0);
});

main().catch(console.error);
