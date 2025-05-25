#!/usr/bin/env node

/**
 * Environment Configuration Test
 * 
 * This script tests if environment variables are being loaded correctly
 */

// Simulate the environment loading process
require('dotenv').config();

console.log('🧪 Testing Environment Configuration');
console.log('=' .repeat(50));

console.log('\n📋 Environment Variables from .env file:');
console.log('APP_ENV:', process.env.APP_ENV);
console.log('API_BASE_URL:', process.env.API_BASE_URL);
console.log('API_TIMEOUT:', process.env.API_TIMEOUT);
console.log('API_RETRY_ATTEMPTS:', process.env.API_RETRY_ATTEMPTS);
console.log('DEBUG:', process.env.DEBUG);

console.log('\n🔧 Parsed Values:');
console.log('API_TIMEOUT (number):', parseInt(process.env.API_TIMEOUT, 10));
console.log('API_RETRY_ATTEMPTS (number):', parseInt(process.env.API_RETRY_ATTEMPTS, 10));
console.log('DEBUG (boolean):', process.env.DEBUG === 'true');

console.log('\n✅ Environment test complete');

// Test API connection
async function testApiConnection() {
  const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/v1';
  const API_TIMEOUT = parseInt(process.env.API_TIMEOUT, 10) || 30000;
  
  console.log('\n🌐 Testing API Connection');
  console.log('URL:', `${API_BASE_URL}/health`);
  console.log('Timeout:', API_TIMEOUT + 'ms');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('✅ Status:', response.status);
    console.log('✅ Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('✅ Response:', data);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ Request timed out after', API_TIMEOUT + 'ms');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testApiConnection().catch(console.error);
