import "dotenv/config";

// Helper function to parse boolean environment variables
const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return defaultValue;
};

// Helper function to parse number environment variables
const parseNumber = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export default {
  name: process.env.APP_NAME || "Ephra",
  slug: process.env.APP_SLUG || "ephra",
  owner: "ephyrtech-org",
  version: process.env.APP_VERSION || "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.IOS_BUNDLE_ID || "com.ephra.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: process.env.ANDROID_PACKAGE || "com.ephra.app",
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "webpack",
  },
  scheme: process.env.URL_SCHEME || "ephra",
  extra: {
    // =============================================================================
    // ENVIRONMENT SETTINGS
    // =============================================================================
    APP_ENV: process.env.APP_ENV || "development",
    NODE_ENV: process.env.NODE_ENV || "development",
    DEBUG: parseBoolean(process.env.DEBUG, true),

    // =============================================================================
    // API CONFIGURATION
    // =============================================================================
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:8000/v1",
    API_BASE_URL_WEB: process.env.API_BASE_URL_WEB || "http://localhost:8000/v1",
    API_TIMEOUT: parseNumber(process.env.API_TIMEOUT, 30000),
    API_RETRY_ATTEMPTS: parseNumber(process.env.API_RETRY_ATTEMPTS, 3),
    API_KEY: process.env.API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,

    // =============================================================================
    // BACKEND SERVICE URLS
    // =============================================================================
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || "ws://localhost:8000/ws",

    // =============================================================================
    // THIRD-PARTY SERVICES
    // =============================================================================
    // Stripe Configuration
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

    // Google Services
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALENDAR_API_KEY: process.env.GOOGLE_CALENDAR_API_KEY,

    // =============================================================================
    // FILE STORAGE & MEDIA
    // =============================================================================
    MAX_FILE_SIZE: parseNumber(process.env.MAX_FILE_SIZE, 10485760),
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif,audio/mpeg,audio/wav,application/pdf",
    UPLOAD_DIRECTORY: process.env.UPLOAD_DIRECTORY || "uploads",

    // Cloud Storage
    CLOUD_STORAGE_PROVIDER: process.env.CLOUD_STORAGE_PROVIDER || "local",
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || "us-east-1",

    // =============================================================================
    // SECURITY SETTINGS
    // =============================================================================
    ACCESS_TOKEN_EXPIRE_MINUTES: parseNumber(process.env.ACCESS_TOKEN_EXPIRE_MINUTES, 43200),
    REFRESH_TOKEN_EXPIRE_DAYS: parseNumber(process.env.REFRESH_TOKEN_EXPIRE_DAYS, 30),
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: parseNumber(process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES, 15),
    RATE_LIMIT_PER_MINUTE: parseNumber(process.env.RATE_LIMIT_PER_MINUTE, 60),
    RATE_LIMIT_BURST: parseNumber(process.env.RATE_LIMIT_BURST, 100),

    // =============================================================================
    // EMAIL CONFIGURATION
    // =============================================================================
    SMTP_SERVER: process.env.SMTP_SERVER || "smtp.gmail.com",
    SMTP_PORT: parseNumber(process.env.SMTP_PORT, 587),
    SMTP_USERNAME: process.env.SMTP_USERNAME,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM || "noreply@ephra.com",
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Ephra Health",

    // =============================================================================
    // NOTIFICATION SERVICES
    // =============================================================================
    EXPO_PUSH_TOKEN: process.env.EXPO_PUSH_TOKEN,
    FCM_SERVER_KEY: process.env.FCM_SERVER_KEY,
    APNS_KEY_ID: process.env.APNS_KEY_ID,
    APNS_TEAM_ID: process.env.APNS_TEAM_ID,

    // =============================================================================
    // ANALYTICS & MONITORING
    // =============================================================================
    SENTRY_DSN: process.env.SENTRY_DSN,
    ANALYTICS_TRACKING_ID: process.env.ANALYTICS_TRACKING_ID,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    ENABLE_PERFORMANCE_MONITORING: parseBoolean(process.env.ENABLE_PERFORMANCE_MONITORING, false),
    PERFORMANCE_SAMPLE_RATE: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE) || 0.1,

    // =============================================================================
    // CACHING & PERFORMANCE
    // =============================================================================
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    CACHE_TTL_SECONDS: parseNumber(process.env.CACHE_TTL_SECONDS, 300),

    // =============================================================================
    // DEVELOPMENT TOOLS
    // =============================================================================
    EXPO_DEVTOOLS: parseBoolean(process.env.EXPO_DEVTOOLS, true),
    REACT_NATIVE_DEBUGGER: parseBoolean(process.env.REACT_NATIVE_DEBUGGER, false),
    FLIPPER_ENABLED: parseBoolean(process.env.FLIPPER_ENABLED, false),
    FAST_REFRESH: parseBoolean(process.env.FAST_REFRESH, true),
    LIVE_RELOAD: parseBoolean(process.env.LIVE_RELOAD, false),

    // =============================================================================
    // MOBILE APP CONFIGURATION
    // =============================================================================
    APP_BUILD_NUMBER: parseNumber(process.env.APP_BUILD_NUMBER, 1),
    UNIVERSAL_LINK_DOMAIN: process.env.UNIVERSAL_LINK_DOMAIN || "ephra.com",

    // =============================================================================
    // FEATURE FLAGS
    // =============================================================================
    FEATURE_STRIPE_PAYMENTS: parseBoolean(process.env.FEATURE_STRIPE_PAYMENTS, true),
    FEATURE_GOOGLE_CALENDAR: parseBoolean(process.env.FEATURE_GOOGLE_CALENDAR, true),
    FEATURE_PUSH_NOTIFICATIONS: parseBoolean(process.env.FEATURE_PUSH_NOTIFICATIONS, true),
    FEATURE_OFFLINE_MODE: parseBoolean(process.env.FEATURE_OFFLINE_MODE, false),
    FEATURE_ANALYTICS: parseBoolean(process.env.FEATURE_ANALYTICS, true),
    FEATURE_CRASH_REPORTING: parseBoolean(process.env.FEATURE_CRASH_REPORTING, true),

    // =============================================================================
    // TESTING CONFIGURATION
    // =============================================================================
    TEST_API_BASE_URL: process.env.TEST_API_BASE_URL || "http://localhost:8001/v1",
    MOCK_EXTERNAL_SERVICES: parseBoolean(process.env.MOCK_EXTERNAL_SERVICES, true),
  },
};
