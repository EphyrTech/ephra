# Environment Configuration Guide

This guide explains how to configure the Ephra project for different environments using environment variables.

## Overview

The Ephra project uses a comprehensive environment configuration system that allows you to:
- Configure different environments (development, staging, production)
- Manage API endpoints and service URLs
- Control feature flags
- Set up third-party service integrations
- Configure security settings
- Manage development tools

## Quick Start

### 1. Choose Your Environment

```bash
# Interactive setup - choose from menu
npm run setup:env

# Or directly specify environment
npm run setup:dev      # Development
npm run setup:staging  # Staging  
npm run setup:prod     # Production
```

### 2. Validate Configuration

```bash
# Validate current environment
npm run env:validate

# Show current environment info
npm run env:show
```

### 3. Test API Connection

```bash
# Test API connectivity
npm run test:api
```

## Environment Files

The project includes several environment configuration files:

- **`.env.example`** - Complete template with all available variables
- **`.env.development`** - Development-specific configuration
- **`.env.staging`** - Staging environment configuration  
- **`.env.production`** - Production environment configuration
- **`.env`** - Your active configuration (created by setup scripts)

## Configuration Categories

### 🌍 Environment Settings

```env
APP_ENV=development          # development, staging, production
NODE_ENV=development         # development, production
DEBUG=true                   # Enable/disable debug logging
```

### 🔗 API Configuration

```env
API_BASE_URL=http://localhost:8000/v1     # Main API endpoint
API_BASE_URL_WEB=http://localhost:8000/v1 # Web-specific API endpoint
API_TIMEOUT=30000                         # Request timeout (ms)
API_RETRY_ATTEMPTS=3                      # Number of retry attempts
```

### 🏗️ Service URLs

```env
BACKEND_URL=http://localhost:8000         # Backend service URL
FRONTEND_URL=http://localhost:3000        # Frontend URL
WEBSOCKET_URL=ws://localhost:8000/ws      # WebSocket endpoint
```

### 💳 Third-Party Services

```env
# Stripe Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Services
GOOGLE_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_API_KEY=your_calendar_key
```

### 📁 File Storage

```env
MAX_FILE_SIZE=10485760                    # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png   # Comma-separated
UPLOAD_DIRECTORY=uploads                  # Local upload directory

# Cloud Storage (AWS S3)
CLOUD_STORAGE_PROVIDER=local              # local, aws, gcp
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### 🔒 Security Settings

```env
ACCESS_TOKEN_EXPIRE_MINUTES=43200         # 30 days
REFRESH_TOKEN_EXPIRE_DAYS=30
RATE_LIMIT_PER_MINUTE=60
```

### 📧 Email Configuration

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@ephra.com
```

### 🚩 Feature Flags

```env
FEATURE_STRIPE_PAYMENTS=true             # Enable Stripe payments
FEATURE_GOOGLE_CALENDAR=true             # Enable calendar integration
FEATURE_PUSH_NOTIFICATIONS=true          # Enable push notifications
FEATURE_OFFLINE_MODE=false               # Enable offline functionality
FEATURE_ANALYTICS=true                   # Enable analytics tracking
FEATURE_CRASH_REPORTING=true             # Enable crash reporting
```

### 📱 Mobile App Configuration

```env
APP_NAME=Ephra                           # App display name
APP_SLUG=ephra                           # URL-friendly name
APP_VERSION=1.0.0                        # App version
IOS_BUNDLE_ID=com.ephra.app              # iOS bundle identifier
ANDROID_PACKAGE=com.ephra.app            # Android package name
URL_SCHEME=ephra                         # Deep linking scheme
```

## Environment-Specific Configurations

### Development Environment

- **Debug logging enabled**
- **Local API endpoints**
- **Test payment keys**
- **Development tools enabled**
- **Relaxed security settings**

```bash
npm run setup:dev
```

### Staging Environment

- **Production-like settings**
- **Staging API endpoints**
- **Test payment keys**
- **Monitoring enabled**
- **Production security**

```bash
npm run setup:staging
```

### Production Environment

- **Debug logging disabled**
- **Production API endpoints**
- **Live payment keys**
- **Full monitoring**
- **Maximum security**

```bash
npm run setup:prod
```

## Using Environment Variables in Code

### Import the Configuration

```typescript
import { ENV, EnvUtils } from '../config/env';

// Access environment variables
const apiUrl = ENV.API_BASE_URL;
const isDebug = ENV.DEBUG;

// Use utility functions
if (EnvUtils.isDevelopment()) {
  console.log('Running in development mode');
}

if (EnvUtils.isFeatureEnabled('FEATURE_STRIPE_PAYMENTS')) {
  // Initialize Stripe
}
```

### Environment Utilities

```typescript
// Check environment
EnvUtils.isDevelopment()    // true if APP_ENV=development
EnvUtils.isProduction()     // true if APP_ENV=production
EnvUtils.isStaging()        // true if APP_ENV=staging

// Check features
EnvUtils.isFeatureEnabled('FEATURE_STRIPE_PAYMENTS')

// Get configuration
EnvUtils.getApiBaseUrl()    // Returns appropriate API URL
EnvUtils.getAllowedFileTypes()  // Returns array of file types

// Validation
EnvUtils.validateRequiredEnvVars()  // Check required variables
```

## Best Practices

### 🔐 Security

1. **Never commit `.env` files** with real secrets
2. **Use different keys** for each environment
3. **Rotate secrets regularly**
4. **Use environment-specific service accounts**

### 🏗️ Development

1. **Start with development environment**
2. **Test with staging before production**
3. **Validate configuration** before deployment
4. **Use feature flags** for gradual rollouts

### 📝 Documentation

1. **Document all custom variables**
2. **Update `.env.example`** when adding variables
3. **Include validation rules**
4. **Provide default values**

## Troubleshooting

### Common Issues

1. **Missing .env file**
   ```bash
   npm run setup:env
   ```

2. **Invalid configuration**
   ```bash
   npm run env:validate
   ```

3. **API connection failed**
   ```bash
   npm run test:api
   ```

4. **Environment not loading**
   - Check `.env` file exists
   - Verify file format (no spaces around =)
   - Restart development server

### Validation Errors

The validation script checks for:
- **Required variables** are set
- **URLs** are valid format
- **Numbers** are positive integers
- **Booleans** are true/false
- **Environment** is valid value

## Advanced Configuration

### Custom Environment Variables

Add new variables to:
1. `.env.example` with documentation
2. `app.config.js` to expose to app
3. `app/config/env.ts` for type safety
4. Validation rules in `scripts/validate-env.js`

### Multiple Environments

Create custom environment files:
```bash
.env.local          # Local overrides
.env.testing        # Testing environment
.env.demo           # Demo environment
```

Then use:
```bash
cp .env.testing .env
npm run env:validate
```

## Support

For questions about environment configuration:
1. Check this documentation
2. Review `.env.example` for all options
3. Run validation to check current setup
4. Test API connection to verify backend connectivity
