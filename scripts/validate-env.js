#!/usr/bin/env node

/**
 * Environment Validation Script
 *
 * This script validates the current environment configuration
 * and checks for missing or invalid environment variables.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions for colored output
const log = {
  info: (msg) => console.log(`${colors.green}[INFO]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  header: (msg) => {
    console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.blue} ${msg}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}`);
  }
};

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    log.error('.env file not found!');
    log.info('Run "npm run setup:env" to create one.');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

// Define validation rules
const validationRules = {
  required: [
    'APP_ENV',
    'API_BASE_URL',
    'BACKEND_URL',
    'FRONTEND_URL'
  ],

  urls: [
    'API_BASE_URL',
    'API_BASE_URL_WEB',
    'BACKEND_URL',
    'FRONTEND_URL',
    'WEBSOCKET_URL'
  ],

  numbers: [
    'API_TIMEOUT',
    'API_RETRY_ATTEMPTS',
    'MAX_FILE_SIZE'
  ],

  booleans: [
    'DEBUG',
    'FEATURE_STRIPE_PAYMENTS',
    'FEATURE_GOOGLE_CALENDAR',
    'FEATURE_PUSH_NOTIFICATIONS',
    'FEATURE_OFFLINE_MODE',
    'FEATURE_ANALYTICS',
    'FEATURE_CRASH_REPORTING',
    'MOCK_EXTERNAL_SERVICES'
  ],

  environments: ['development', 'staging', 'production'],

  logLevels: ['debug', 'info', 'warn', 'error'],

  storageProviders: ['local', 'aws', 'gcp']
};

// Validation functions
function validateRequired(envVars) {
  const missing = [];

  validationRules.required.forEach(key => {
    if (!envVars[key] || envVars[key].trim() === '') {
      missing.push(key);
    }
  });

  return missing;
}

function validateUrls(envVars) {
  const invalid = [];

  validationRules.urls.forEach(key => {
    const value = envVars[key];
    if (value && value.trim() !== '') {
      try {
        new URL(value);
      } catch (error) {
        invalid.push({ key, value, error: 'Invalid URL format' });
      }
    }
  });

  return invalid;
}

function validateNumbers(envVars) {
  const invalid = [];

  validationRules.numbers.forEach(key => {
    const value = envVars[key];
    if (value && value.trim() !== '') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) {
        invalid.push({ key, value, error: 'Must be a positive number' });
      }
    }
  });

  return invalid;
}

function validateBooleans(envVars) {
  const invalid = [];

  validationRules.booleans.forEach(key => {
    const value = envVars[key];
    if (value && value.trim() !== '') {
      if (!['true', 'false'].includes(value.toLowerCase())) {
        invalid.push({ key, value, error: 'Must be "true" or "false"' });
      }
    }
  });

  return invalid;
}

function validateEnvironment(envVars) {
  const appEnv = envVars.APP_ENV;
  if (appEnv && !validationRules.environments.includes(appEnv)) {
    return { key: 'APP_ENV', value: appEnv, error: `Must be one of: ${validationRules.environments.join(', ')}` };
  }
  return null;
}

function validateLogLevel(envVars) {
  const logLevel = envVars.LOG_LEVEL;
  if (logLevel && !validationRules.logLevels.includes(logLevel)) {
    return { key: 'LOG_LEVEL', value: logLevel, error: `Must be one of: ${validationRules.logLevels.join(', ')}` };
  }
  return null;
}

function validateStorageProvider(envVars) {
  const provider = envVars.CLOUD_STORAGE_PROVIDER;
  if (provider && !validationRules.storageProviders.includes(provider)) {
    return { key: 'CLOUD_STORAGE_PROVIDER', value: provider, error: `Must be one of: ${validationRules.storageProviders.join(', ')}` };
  }
  return null;
}

function validateEnvironmentSpecific(envVars) {
  const warnings = [];
  const appEnv = envVars.APP_ENV;

  // Production-specific validations
  if (appEnv === 'production') {
    if (envVars.DEBUG === 'true') {
      warnings.push('DEBUG should be false in production');
    }

    if (envVars.LOG_LEVEL === 'debug') {
      warnings.push('LOG_LEVEL should not be debug in production');
    }

    if (!envVars.SENTRY_DSN) {
      warnings.push('SENTRY_DSN should be set in production for error monitoring');
    }

    if (envVars.STRIPE_PUBLISHABLE_KEY && envVars.STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_')) {
      warnings.push('Using test Stripe keys in production environment');
    }
  }

  // Development-specific validations
  if (appEnv === 'development') {
    if (envVars.DEBUG === 'false') {
      warnings.push('DEBUG should typically be true in development');
    }
  }

  return warnings;
}

// Main validation function
function validateEnvironment() {
  log.header('EPHRA ENVIRONMENT VALIDATION');

  const envVars = loadEnvFile();
  if (!envVars) {
    return false;
  }

  let isValid = true;
  const warnings = [];

  // Check required variables
  const missingRequired = validateRequired(envVars);
  if (missingRequired.length > 0) {
    log.error('Missing required environment variables:');
    missingRequired.forEach(key => console.log(`  - ${key}`));
    isValid = false;
  }

  // Validate URLs
  const invalidUrls = validateUrls(envVars);
  if (invalidUrls.length > 0) {
    log.error('Invalid URL format:');
    invalidUrls.forEach(({ key, value, error }) => {
      console.log(`  - ${key}: ${value} (${error})`);
    });
    isValid = false;
  }

  // Validate numbers
  const invalidNumbers = validateNumbers(envVars);
  if (invalidNumbers.length > 0) {
    log.error('Invalid number format:');
    invalidNumbers.forEach(({ key, value, error }) => {
      console.log(`  - ${key}: ${value} (${error})`);
    });
    isValid = false;
  }

  // Validate booleans
  const invalidBooleans = validateBooleans(envVars);
  if (invalidBooleans.length > 0) {
    log.error('Invalid boolean format:');
    invalidBooleans.forEach(({ key, value, error }) => {
      console.log(`  - ${key}: ${value} (${error})`);
    });
    isValid = false;
  }

  // Validate specific values
  const envError = validateEnvironment(envVars);
  if (envError) {
    log.error(`Invalid environment: ${envError.key}: ${envError.value} (${envError.error})`);
    isValid = false;
  }

  const logError = validateLogLevel(envVars);
  if (logError) {
    log.error(`Invalid log level: ${logError.key}: ${logError.value} (${logError.error})`);
    isValid = false;
  }

  const storageError = validateStorageProvider(envVars);
  if (storageError) {
    log.error(`Invalid storage provider: ${storageError.key}: ${storageError.value} (${storageError.error})`);
    isValid = false;
  }

  // Environment-specific warnings
  const envWarnings = validateEnvironmentSpecific(envVars);
  warnings.push(...envWarnings);

  // Show warnings
  if (warnings.length > 0) {
    console.log('');
    log.warn('Environment warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  // Show summary
  console.log('');
  if (isValid) {
    log.info('✅ Environment validation passed!');
    console.log('');
    log.info(`Current environment: ${envVars.APP_ENV}`);
    log.info(`API Base URL: ${envVars.API_BASE_URL}`);
    log.info(`Debug mode: ${envVars.DEBUG}`);
  } else {
    log.error('❌ Environment validation failed!');
    console.log('');
    log.info('Please fix the errors above and run validation again.');
  }

  return isValid;
}

// Run validation
if (require.main === module) {
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment, loadEnvFile };
