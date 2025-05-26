#!/bin/bash

# CRC Error Fix Script for Ephra Project
# This script implements multiple strategies to resolve the Webpack CRC compilation error

set -e

echo "🔧 Ephra CRC Error Fix Script"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to clean build artifacts
clean_build_artifacts() {
    print_status "Cleaning build artifacts..."
    rm -rf .expo/ dist/ web-build/ node_modules/.cache/ 2>/dev/null || true
    print_success "Build artifacts cleaned"
}

# Solution 1: Custom Webpack Configuration
solution_custom_webpack() {
    print_status "Solution 1: Creating custom webpack configuration..."
    
    cat > webpack.config.crc-fix.js << 'EOF'
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: 'development'
  }, argv);
  
  // Force single-threaded compilation to avoid race conditions
  config.parallelism = 1;
  
  // Disable problematic optimizations
  config.optimization = {
    minimize: false,
    splitChunks: false,
    concatenateModules: false,
    usedExports: false,
    sideEffects: false
  };
  
  // Disable caching to avoid corruption
  config.cache = false;
  
  // Disable source maps to reduce memory usage
  config.devtool = false;
  
  // Reduce chunk size to identify problematic modules
  if (config.optimization.splitChunks) {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 50000, // 50KB chunks
      cacheGroups: {
        default: false,
        vendors: false
      }
    };
  }
  
  // Add error handling
  config.stats = {
    errors: true,
    warnings: true,
    errorDetails: true
  };
  
  return config;
};
EOF

    print_status "Testing with custom webpack configuration..."
    export NODE_OPTIONS="--max-old-space-size=8192"
    EXPO_WEBPACK_CONFIG_PATH="./webpack.config.crc-fix.js" npx expo export:web --dev
}

# Solution 2: Dependency Downgrade
solution_dependency_downgrade() {
    print_status "Solution 2: Downgrading problematic dependencies..."
    
    # Backup current package.json
    cp package.json package.json.backup
    
    # Downgrade expo webpack config
    npm install @expo/webpack-config@18.1.3 --save-dev
    
    print_status "Testing with downgraded dependencies..."
    npx expo export:web --dev
    
    # If it fails, restore backup
    if [ $? -ne 0 ]; then
        print_warning "Downgrade didn't work, restoring original package.json..."
        mv package.json.backup package.json
        npm install
    else
        print_success "Downgrade successful!"
        rm package.json.backup
    fi
}

# Solution 3: Alternative Build Process
solution_alternative_build() {
    print_status "Solution 3: Using alternative build process..."
    
    # Install webpack-cli if not present
    if ! npm list webpack-cli >/dev/null 2>&1; then
        print_status "Installing webpack-cli..."
        npm install --save-dev webpack-cli
    fi
    
    # Create a simple webpack config
    cat > webpack.simple.js << 'EOF'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './App.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
  ],
  devtool: false,
  cache: false,
};
EOF

    print_status "Building with simple webpack configuration..."
    npx webpack --config webpack.simple.js
}

# Solution 4: Metro Bundler Alternative
solution_metro_bundler() {
    print_status "Solution 4: Trying Metro bundler for web..."
    
    # Check if metro is available
    if npm list @expo/metro-config >/dev/null 2>&1; then
        print_status "Using Metro bundler..."
        npx expo export --platform web
    else
        print_warning "Metro web support not available, skipping..."
    fi
}

# Solution 5: Development Server
solution_dev_server() {
    print_status "Solution 5: Starting development server (recommended for development)..."
    
    print_status "Starting Expo development server..."
    print_warning "This will start a development server. Press Ctrl+C to stop."
    print_warning "Open http://localhost:19006 in your browser to view the app."
    
    npx expo start --web --port 19006
}

# Main menu
show_menu() {
    echo ""
    echo "Select a solution to try:"
    echo "1) Custom Webpack Configuration (Recommended)"
    echo "2) Dependency Downgrade"
    echo "3) Alternative Build Process"
    echo "4) Metro Bundler"
    echo "5) Development Server (for development)"
    echo "6) Try All Solutions"
    echo "7) Clean and Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

# Main execution
main() {
    print_status "CRC Error Fix Script for Ephra Project"
    print_status "Current directory: $(pwd)"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the ephra project directory."
        exit 1
    fi
    
    # Clean build artifacts first
    clean_build_artifacts
    
    while true; do
        show_menu
        
        case $choice in
            1)
                solution_custom_webpack
                ;;
            2)
                solution_dependency_downgrade
                ;;
            3)
                solution_alternative_build
                ;;
            4)
                solution_metro_bundler
                ;;
            5)
                solution_dev_server
                ;;
            6)
                print_status "Trying all solutions..."
                solution_custom_webpack || solution_dependency_downgrade || solution_alternative_build || solution_metro_bundler
                ;;
            7)
                clean_build_artifacts
                print_success "Cleanup completed. Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue or Ctrl+C to exit..."
    done
}

# Run main function
main
