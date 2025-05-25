const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.resolver.assetExts.push(
  // Add any additional asset extensions you need
  'bin'
);

// Optimize file watching
config.watchFolders = [];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ignore certain directories to reduce file watching
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
  /.*\/__tests__\/.*/,
];

module.exports = config;
