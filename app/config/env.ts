import Constants from 'expo-constants';

/**
 * Environment Configuration
 *
 * This module provides a centralized way to access environment variables
 * throughout the application. All environment variables are accessed through
 * Expo Constants to ensure they work across all platforms.
 */

// Get the extra configuration from Expo Constants
const expoConfig = Constants.expoConfig?.extra || {};

// Debug environment loading
if (__DEV__) {
  console.log('🔧 Environment Debug Info:');
  console.log('Constants.expoConfig?.extra:', expoConfig);
  console.log('Available keys:', Object.keys(expoConfig));
}

/**
 * Environment Configuration Object
 *
 * Contains all environment variables with proper typing and fallbacks
 */
export const ENV = {
  // =============================================================================
  // ENVIRONMENT SETTINGS
  // =============================================================================
  APP_ENV: (expoConfig.APP_ENV || 'development') as 'development' | 'staging' | 'production',
  NODE_ENV: (expoConfig.NODE_ENV || 'development') as 'development' | 'production',
  DEBUG: expoConfig.DEBUG !== undefined ? expoConfig.DEBUG : true,

  // =============================================================================
  // API CONFIGURATION
  // =============================================================================
  API_BASE_URL: expoConfig.API_BASE_URL || 'http://localhost:8000/v1',
  API_BASE_URL_WEB: expoConfig.API_BASE_URL_WEB || 'http://localhost:8000/v1',
  API_TIMEOUT: expoConfig.API_TIMEOUT || 30000,
  API_RETRY_ATTEMPTS: expoConfig.API_RETRY_ATTEMPTS || 3,
  API_KEY: expoConfig.API_KEY as string | undefined,
  JWT_SECRET: expoConfig.JWT_SECRET as string | undefined,

  // =============================================================================
  // BACKEND SERVICE URLS
  // =============================================================================
  BACKEND_URL: expoConfig.BACKEND_URL || 'http://localhost:8000',
  FRONTEND_URL: expoConfig.FRONTEND_URL || 'http://localhost:3000',
  WEBSOCKET_URL: expoConfig.WEBSOCKET_URL || 'ws://localhost:8000/ws',

  // =============================================================================
  // THIRD-PARTY SERVICES
  // =============================================================================
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: expoConfig.STRIPE_PUBLISHABLE_KEY as string | undefined,
  STRIPE_SECRET_KEY: expoConfig.STRIPE_SECRET_KEY as string | undefined,
  STRIPE_WEBHOOK_SECRET: expoConfig.STRIPE_WEBHOOK_SECRET as string | undefined,

  // Google Services
  GOOGLE_API_KEY: expoConfig.GOOGLE_API_KEY as string | undefined,
  GOOGLE_CLIENT_ID: expoConfig.GOOGLE_CLIENT_ID as string | undefined,
  GOOGLE_CLIENT_SECRET: expoConfig.GOOGLE_CLIENT_SECRET as string | undefined,
  GOOGLE_CALENDAR_API_KEY: expoConfig.GOOGLE_CALENDAR_API_KEY as string | undefined,

  // =============================================================================
  // FILE STORAGE & MEDIA
  // =============================================================================
  MAX_FILE_SIZE: expoConfig.MAX_FILE_SIZE as number,
  ALLOWED_FILE_TYPES: expoConfig.ALLOWED_FILE_TYPES as string,
  UPLOAD_DIRECTORY: expoConfig.UPLOAD_DIRECTORY as string,

  // Cloud Storage
  CLOUD_STORAGE_PROVIDER: expoConfig.CLOUD_STORAGE_PROVIDER as 'local' | 'aws' | 'gcp',
  AWS_S3_BUCKET: expoConfig.AWS_S3_BUCKET as string | undefined,
  AWS_ACCESS_KEY_ID: expoConfig.AWS_ACCESS_KEY_ID as string | undefined,
  AWS_SECRET_ACCESS_KEY: expoConfig.AWS_SECRET_ACCESS_KEY as string | undefined,
  AWS_REGION: expoConfig.AWS_REGION as string,

  // =============================================================================
  // SECURITY SETTINGS
  // =============================================================================
  ACCESS_TOKEN_EXPIRE_MINUTES: expoConfig.ACCESS_TOKEN_EXPIRE_MINUTES as number,
  REFRESH_TOKEN_EXPIRE_DAYS: expoConfig.REFRESH_TOKEN_EXPIRE_DAYS as number,
  PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: expoConfig.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES as number,
  RATE_LIMIT_PER_MINUTE: expoConfig.RATE_LIMIT_PER_MINUTE as number,
  RATE_LIMIT_BURST: expoConfig.RATE_LIMIT_BURST as number,

  // =============================================================================
  // EMAIL CONFIGURATION
  // =============================================================================
  SMTP_SERVER: expoConfig.SMTP_SERVER as string,
  SMTP_PORT: expoConfig.SMTP_PORT as number,
  SMTP_USERNAME: expoConfig.SMTP_USERNAME as string | undefined,
  SMTP_PASSWORD: expoConfig.SMTP_PASSWORD as string | undefined,
  EMAIL_FROM: expoConfig.EMAIL_FROM as string,
  EMAIL_FROM_NAME: expoConfig.EMAIL_FROM_NAME as string,

  // =============================================================================
  // NOTIFICATION SERVICES
  // =============================================================================
  EXPO_PUSH_TOKEN: expoConfig.EXPO_PUSH_TOKEN as string | undefined,
  FCM_SERVER_KEY: expoConfig.FCM_SERVER_KEY as string | undefined,
  APNS_KEY_ID: expoConfig.APNS_KEY_ID as string | undefined,
  APNS_TEAM_ID: expoConfig.APNS_TEAM_ID as string | undefined,

  // =============================================================================
  // ANALYTICS & MONITORING
  // =============================================================================
  SENTRY_DSN: expoConfig.SENTRY_DSN as string | undefined,
  ANALYTICS_TRACKING_ID: expoConfig.ANALYTICS_TRACKING_ID as string | undefined,
  LOG_LEVEL: expoConfig.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
  ENABLE_PERFORMANCE_MONITORING: expoConfig.ENABLE_PERFORMANCE_MONITORING as boolean,
  PERFORMANCE_SAMPLE_RATE: expoConfig.PERFORMANCE_SAMPLE_RATE as number,

  // =============================================================================
  // CACHING & PERFORMANCE
  // =============================================================================
  REDIS_URL: expoConfig.REDIS_URL as string,
  CACHE_TTL_SECONDS: expoConfig.CACHE_TTL_SECONDS as number,

  // =============================================================================
  // DEVELOPMENT TOOLS
  // =============================================================================
  EXPO_DEVTOOLS: expoConfig.EXPO_DEVTOOLS as boolean,
  REACT_NATIVE_DEBUGGER: expoConfig.REACT_NATIVE_DEBUGGER as boolean,
  FLIPPER_ENABLED: expoConfig.FLIPPER_ENABLED as boolean,
  FAST_REFRESH: expoConfig.FAST_REFRESH as boolean,
  LIVE_RELOAD: expoConfig.LIVE_RELOAD as boolean,

  // =============================================================================
  // MOBILE APP CONFIGURATION
  // =============================================================================
  APP_BUILD_NUMBER: expoConfig.APP_BUILD_NUMBER as number,
  UNIVERSAL_LINK_DOMAIN: expoConfig.UNIVERSAL_LINK_DOMAIN as string,

  // =============================================================================
  // FEATURE FLAGS
  // =============================================================================
  FEATURE_STRIPE_PAYMENTS: expoConfig.FEATURE_STRIPE_PAYMENTS as boolean,
  FEATURE_GOOGLE_CALENDAR: expoConfig.FEATURE_GOOGLE_CALENDAR as boolean,
  FEATURE_PUSH_NOTIFICATIONS: expoConfig.FEATURE_PUSH_NOTIFICATIONS as boolean,
  FEATURE_OFFLINE_MODE: expoConfig.FEATURE_OFFLINE_MODE as boolean,
  FEATURE_ANALYTICS: expoConfig.FEATURE_ANALYTICS as boolean,
  FEATURE_CRASH_REPORTING: expoConfig.FEATURE_CRASH_REPORTING as boolean,

  // =============================================================================
  // TESTING CONFIGURATION
  // =============================================================================
  TEST_API_BASE_URL: expoConfig.TEST_API_BASE_URL as string,
  MOCK_EXTERNAL_SERVICES: expoConfig.MOCK_EXTERNAL_SERVICES as boolean,
} as const;

/**
 * Helper functions for environment configuration
 */
export const EnvUtils = {
  /**
   * Check if the app is running in development mode
   */
  isDevelopment: () => ENV.APP_ENV === 'development',

  /**
   * Check if the app is running in production mode
   */
  isProduction: () => ENV.APP_ENV === 'production',

  /**
   * Check if the app is running in staging mode
   */
  isStaging: () => ENV.APP_ENV === 'staging',

  /**
   * Check if debugging is enabled
   */
  isDebugEnabled: () => ENV.DEBUG,

  /**
   * Get the appropriate API base URL based on platform
   */
  getApiBaseUrl: () => {
    // You can add platform-specific logic here if needed
    return ENV.API_BASE_URL;
  },

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled: (feature: keyof typeof ENV) => {
    return Boolean(ENV[feature]);
  },

  /**
   * Get file type array from comma-separated string
   */
  getAllowedFileTypes: () => {
    return ENV.ALLOWED_FILE_TYPES.split(',').map(type => type.trim());
  },

  /**
   * Validate required environment variables
   */
  validateRequiredEnvVars: () => {
    const required = [
      'API_BASE_URL',
      'BACKEND_URL',
    ];

    const missing = required.filter(key => !ENV[key as keyof typeof ENV]);

    if (missing.length > 0) {
      console.warn('Missing required environment variables:', missing);
      return false;
    }

    return true;
  },

  /**
   * Log current environment configuration (for debugging)
   */
  logEnvironmentInfo: () => {
    if (ENV.DEBUG) {
      console.log('Environment Configuration:', {
        APP_ENV: ENV.APP_ENV,
        API_BASE_URL: ENV.API_BASE_URL,
        DEBUG: ENV.DEBUG,
        FEATURES: {
          STRIPE_PAYMENTS: ENV.FEATURE_STRIPE_PAYMENTS,
          GOOGLE_CALENDAR: ENV.FEATURE_GOOGLE_CALENDAR,
          PUSH_NOTIFICATIONS: ENV.FEATURE_PUSH_NOTIFICATIONS,
          OFFLINE_MODE: ENV.FEATURE_OFFLINE_MODE,
          ANALYTICS: ENV.FEATURE_ANALYTICS,
          CRASH_REPORTING: ENV.FEATURE_CRASH_REPORTING,
        }
      });
    }
  }
};

// Validate environment on module load
EnvUtils.validateRequiredEnvVars();

// Log environment info in development
if (EnvUtils.isDevelopment()) {
  EnvUtils.logEnvironmentInfo();
}

export default ENV;
