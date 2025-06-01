// Load environment-specific configuration
const path = require('path');
const dotenv = require('dotenv');

// Force production environment for web deployments
const isWebDeployment = process.env.EAS_BUILD_PLATFORM === 'web' ||
                       process.env.EXPO_PUBLIC_ENV === 'production' ||
                       typeof window !== 'undefined';

const environment = isWebDeployment ? 'production' : (process.env.NODE_ENV || process.env.APP_ENV || 'development');
const envFile = `.env.${environment}`;

console.log(`🔧 Environment detection: ${environment}`);
console.log(`🔧 Is web deployment: ${isWebDeployment}`);
console.log(`🔧 EAS_BUILD_PLATFORM: ${process.env.EAS_BUILD_PLATFORM}`);

// Always try to load .env first (our fallback), then environment-specific
const fallbackPath = path.resolve(__dirname, '.env');
const envPath = path.resolve(__dirname, envFile);

try {
  dotenv.config({ path: fallbackPath });
  console.log(`✅ Loaded base config from: .env`);
} catch (error) {
  console.log(`⚠️ Could not load .env file`);
}

try {
  dotenv.config({ path: envPath, override: false });
  console.log(`✅ Loaded environment config from: ${envFile}`);
} catch (error) {
  console.log(`⚠️ Could not load ${envFile}, using .env only`);
}

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

// Debug environment variables
console.log(`🔧 API_BASE_URL from env: ${process.env.API_BASE_URL}`);
console.log(`🔧 BACKEND_URL from env: ${process.env.BACKEND_URL}`);

module.exports = {
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
    bundler: "metro",
  },
  scheme: process.env.URL_SCHEME || "ephra",
  updates: {
    url: "https://u.expo.dev/1c99de5e-1fd2-4bbb-91ca-836adf6520c6"
  },
  runtimeVersion: {
    policy: "appVersion"
  },
  plugins: [
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#4CAF50"
      }
    ],
    "expo-web-browser"
  ],
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
    API_BASE_URL: process.env.API_BASE_URL || "default/v1",
    API_BASE_URL_WEB: process.env.API_BASE_URL_WEB || "default/v1",
    API_TIMEOUT: parseNumber(process.env.API_TIMEOUT, 30000),
    API_RETRY_ATTEMPTS: parseNumber(process.env.API_RETRY_ATTEMPTS, 3),
    API_KEY: process.env.API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,

    // =============================================================================
    // BACKEND SERVICE URLS
    // =============================================================================
    BACKEND_URL: process.env.BACKEND_URL || "default",
    FRONTEND_URL: process.env.FRONTEND_URL || "default",
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || "wss://default/ws",

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

    // =============================================================================
    // EAS CONFIGURATION
    // =============================================================================
    eas: {
      projectId: "1c99de5e-1fd2-4bbb-91ca-836adf6520c6"
    },
  },
};
