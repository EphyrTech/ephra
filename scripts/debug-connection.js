#!/usr/bin/env node

/**
 * Comprehensive Connection Debug Script
 * 
 * This script helps debug the "Invalid HTTP request received" issue
 * by testing various connection scenarios and protocols
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'localhost:8000';
const API_PATH = '/v1/health';

console.log('🔍 Debugging Connection Issues');
console.log('=' .repeat(60));

// Test 1: Raw HTTP request
async function testRawHTTP() {
  console.log('\n1️⃣ Testing Raw HTTP Request');
  console.log(`URL: http://${BASE_URL}${API_PATH}`);
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8000,
      path: API_PATH,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Script/1.0'
      }
    }, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`✅ Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ Response: ${data}`);
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ HTTP Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`❌ HTTP Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 2: Fetch with HTTP
async function testFetchHTTP() {
  console.log('\n2️⃣ Testing Fetch with HTTP');
  const url = `http://${BASE_URL}${API_PATH}`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Script-Fetch/1.0'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Status Text: ${response.statusText}`);
    console.log(`✅ Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log(`✅ Response: ${data}`);
    return true;
  } catch (error) {
    console.log(`❌ Fetch Error: ${error.message}`);
    return false;
  }
}

// Test 3: Try HTTPS (should fail but shows what happens)
async function testHTTPS() {
  console.log('\n3️⃣ Testing HTTPS (should fail)');
  const url = `https://${BASE_URL}${API_PATH}`;
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`⚠️ HTTPS worked unexpectedly: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`✅ HTTPS failed as expected: ${error.message}`);
    return false;
  }
}

// Test 4: Test with different headers
async function testWithDifferentHeaders() {
  console.log('\n4️⃣ Testing with Different Headers');
  const url = `http://${BASE_URL}${API_PATH}`;
  
  const headerSets = [
    { name: 'Basic JSON', headers: { 'Content-Type': 'application/json' } },
    { name: 'With Accept', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } },
    { name: 'With CORS', headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' } },
    { name: 'Minimal', headers: {} }
  ];
  
  for (const { name, headers } of headerSets) {
    console.log(`\n  Testing ${name}:`);
    try {
      const response = await fetch(url, { method: 'GET', headers });
      console.log(`  ✅ ${name}: ${response.status}`);
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
    }
  }
}

// Test 5: Test POST request (like login)
async function testPOSTRequest() {
  console.log('\n5️⃣ Testing POST Request (like login)');
  const url = `http://${BASE_URL}/v1/auth/login`;
  console.log(`URL: ${url}`);
  
  const testData = {
    email: 'test@example.com',
    password: 'testpassword'
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Status Text: ${response.statusText}`);
    
    const data = await response.text();
    console.log(`✅ Response: ${data}`);
    return true;
  } catch (error) {
    console.log(`❌ POST Error: ${error.message}`);
    return false;
  }
}

// Test 6: Check if backend is actually running
async function testBackendHealth() {
  console.log('\n6️⃣ Testing Backend Health');
  
  const endpoints = [
    '/v1/health',
    '/v1/docs',
    '/docs',
    '/health',
    '/'
  ];
  
  for (const endpoint of endpoints) {
    const url = `http://${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url);
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log(`📅 Time: ${new Date().toISOString()}`);
  
  const results = {
    rawHTTP: await testRawHTTP(),
    fetchHTTP: await testFetchHTTP(),
    https: await testHTTPS(),
    post: await testPOSTRequest()
  };
  
  await testWithDifferentHeaders();
  await testBackendHealth();
  
  console.log('\n📊 Summary:');
  console.log(`Raw HTTP: ${results.rawHTTP ? '✅' : '❌'}`);
  console.log(`Fetch HTTP: ${results.fetchHTTP ? '✅' : '❌'}`);
  console.log(`HTTPS (should fail): ${results.https ? '⚠️' : '✅'}`);
  console.log(`POST Request: ${results.post ? '✅' : '❌'}`);
  
  console.log('\n🔧 Troubleshooting Tips:');
  
  if (!results.rawHTTP && !results.fetchHTTP) {
    console.log('❌ Backend appears to be down or unreachable');
    console.log('   - Check if backend is running: docker compose ps');
    console.log('   - Check backend logs: docker compose logs backend');
    console.log('   - Try: curl http://localhost:8000/v1/health');
  } else if (results.rawHTTP && !results.fetchHTTP) {
    console.log('⚠️ Raw HTTP works but fetch fails - possible Node.js/browser difference');
  } else if (results.https) {
    console.log('⚠️ HTTPS is working - check if backend has SSL enabled');
  } else {
    console.log('✅ HTTP connections working - issue might be in React Native app');
    console.log('   - Clear React Native cache: npx expo start --clear');
    console.log('   - Check app environment loading');
    console.log('   - Verify app.config.js is using correct URLs');
  }
  
  console.log('\n🔍 Next Steps:');
  console.log('1. If backend is down: docker compose up -d');
  console.log('2. If HTTP works: Check React Native app configuration');
  console.log('3. If HTTPS works unexpectedly: Check backend SSL settings');
  console.log('4. Check backend CORS configuration for your frontend origin');
}

main().catch(console.error);
