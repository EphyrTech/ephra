const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add any custom configuration here
config.resolver.assetExts.push(
  // Add any additional asset extensions you need
  'bin'
);

// Configure resolver to handle problematic modules
config.resolver.alias = {
  // Fix react-async-hook resolution issue
  'react-async-hook': path.resolve(__dirname, 'node_modules/react-async-hook/dist/react-async-hook.esm.js'),
  // Fix metro-runtime symbolicate issue
  '@expo/metro-runtime/symbolicate': path.resolve(__dirname, 'noop.js'),
};

// Optimize file watching
config.watchFolders = [];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Ignore certain directories to reduce file watching
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
  /.*\/__tests__\/.*/,
];

module.exports = config;
