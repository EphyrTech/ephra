#!/bin/bash

# Specific CRC Error Debugging Script
# This script implements targeted strategies to identify the root cause of the CRC error

set -e

echo "🔍 CRC Error Specific Debugging"
echo "==============================="

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

# Strategy 1: Clean build with minimal dependencies
strategy_minimal_build() {
    print_status "Strategy 1: Minimal Build Test"
    
    # Create a minimal webpack config
    cat > webpack.config.minimal.js << 'EOF'
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: 'development',
    babel: {
      dangerouslyAddModulePathsToTranspile: []
    }
  }, argv);
  
  // Disable source maps to avoid CRC issues
  config.devtool = false;
  
  // Reduce optimization to minimal
  config.optimization = {
    minimize: false,
    splitChunks: false
  };
  
  // Disable cache
  config.cache = false;
  
  return config;
};
EOF

    print_status "Testing with minimal webpack configuration..."
    EXPO_WEBPACK_CONFIG_PATH="./webpack.config.minimal.js" npx expo export:web --dev
}

# Strategy 2: Identify problematic modules
strategy_module_analysis() {
    print_status "Strategy 2: Module Analysis"
    
    # Create a webpack config with detailed logging
    cat > webpack.config.debug.js << 'EOF'
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add detailed logging
  config.stats = {
    all: false,
    modules: true,
    maxModules: Infinity,
    errors: true,
    warnings: true,
    moduleTrace: true,
    errorDetails: true
  };
  
  // Add progress plugin for detailed progress
  const webpack = require('webpack');
  config.plugins.push(
    new webpack.ProgressPlugin((percentage, message, ...args) => {
      console.log(`${Math.round(percentage * 100)}%: ${message} ${args.join(' ')}`);
    })
  );
  
  return config;
};
EOF

    print_status "Running build with detailed module logging..."
    EXPO_WEBPACK_CONFIG_PATH="./webpack.config.debug.js" npx expo export:web --dev 2>&1 | tee build-debug.log
}

# Strategy 3: Memory optimization
strategy_memory_optimization() {
    print_status "Strategy 3: Memory Optimization"
    
    export NODE_OPTIONS="--max-old-space-size=16384 --trace-warnings --trace-deprecation --expose-gc"
    
    # Force garbage collection before build
    node -e "if (global.gc) { global.gc(); console.log('Garbage collection completed'); }"
    
    print_status "Running build with optimized memory settings..."
    npx expo export:web --dev
}

# Strategy 4: Incremental build
strategy_incremental_build() {
    print_status "Strategy 4: Incremental Build Test"
    
    # Remove specific cache directories that might be corrupted
    rm -rf .expo/web-build-cache/
    rm -rf node_modules/.cache/
    rm -rf dist/
    rm -rf web-build/
    
    # Create webpack config with incremental building
    cat > webpack.config.incremental.js << 'EOF'
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Enable incremental builds
  config.cache = {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  };
  
  // Reduce chunk size to identify problematic chunks
  config.optimization.splitChunks = {
    chunks: 'all',
    maxSize: 100000, // 100KB chunks
    cacheGroups: {
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true
      },
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: -10,
        chunks: 'all',
        maxSize: 50000 // 50KB vendor chunks
      }
    }
  };
  
  return config;
};
EOF

    print_status "Running incremental build..."
    EXPO_WEBPACK_CONFIG_PATH="./webpack.config.incremental.js" npx expo export:web --dev
}

# Strategy 5: Dependency analysis
strategy_dependency_analysis() {
    print_status "Strategy 5: Dependency Analysis"
    
    print_status "Checking for problematic dependencies..."
    
    # Check for known problematic packages
    npm list --depth=0 | grep -E "(webpack|babel|expo)" || true
    
    # Check for duplicate dependencies
    npm ls --depth=0 2>&1 | grep -i "extraneous\|missing\|invalid" || true
    
    # Verify package integrity
    npm audit --audit-level=moderate || true
}

# Strategy 6: File system check
strategy_filesystem_check() {
    print_status "Strategy 6: File System Check"
    
    # Check for file system issues
    print_status "Checking file permissions..."
    find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -10 | xargs ls -la
    
    # Check for corrupted files
    print_status "Checking for potential file corruption..."
    find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -20 | while read file; do
        if ! node -c "$file" 2>/dev/null; then
            print_warning "Potential syntax issue in: $file"
        fi
    done
}

# Main execution
main() {
    print_status "Starting CRC Error Specific Debugging..."
    
    echo ""
    echo "Available debugging strategies:"
    echo "1) Minimal Build Test"
    echo "2) Module Analysis"
    echo "3) Memory Optimization"
    echo "4) Incremental Build"
    echo "5) Dependency Analysis"
    echo "6) File System Check"
    echo "7) Run All Strategies"
    echo ""
    
    if [ "$1" ]; then
        choice="$1"
    else
        read -p "Enter your choice (1-7): " choice
    fi
    
    case $choice in
        1)
            strategy_minimal_build
            ;;
        2)
            strategy_module_analysis
            ;;
        3)
            strategy_memory_optimization
            ;;
        4)
            strategy_incremental_build
            ;;
        5)
            strategy_dependency_analysis
            ;;
        6)
            strategy_filesystem_check
            ;;
        7)
            print_status "Running all strategies..."
            strategy_dependency_analysis
            strategy_filesystem_check
            strategy_minimal_build
            strategy_memory_optimization
            strategy_incremental_build
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
