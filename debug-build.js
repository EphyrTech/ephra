#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a minimal App.tsx for testing
const createMinimalApp = () => {
  return `
import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Minimal Test App</Text>
    </View>
  );
}
`;
};

// Create a minimal app.config.js for testing
const createMinimalConfig = () => {
  return `
require("dotenv").config();

module.exports = {
  expo: {
    name: "ephra-test",
    slug: "ephra-test",
    version: "1.0.0",
    platforms: ["web"],
    web: {
      bundler: "webpack"
    }
  }
};
`;
};

// Test with minimal setup
function testMinimalBuild() {
  console.log('🧪 Testing with minimal setup...');
  
  // Backup original files
  if (fs.existsSync('App.tsx')) {
    fs.copyFileSync('App.tsx', 'App.tsx.backup');
  }
  if (fs.existsSync('app.config.js')) {
    fs.copyFileSync('app.config.js', 'app.config.js.backup');
  }
  
  try {
    // Create minimal files
    fs.writeFileSync('App.tsx', createMinimalApp());
    fs.writeFileSync('app.config.js', createMinimalConfig());
    
    // Try to build
    execSync('npx expo export:web', { stdio: 'inherit' });
    console.log('✅ Minimal build succeeded!');
    return true;
  } catch (error) {
    console.log('❌ Minimal build failed:', error.message);
    return false;
  } finally {
    // Restore original files
    if (fs.existsSync('App.tsx.backup')) {
      fs.copyFileSync('App.tsx.backup', 'App.tsx');
      fs.unlinkSync('App.tsx.backup');
    }
    if (fs.existsSync('app.config.js.backup')) {
      fs.copyFileSync('app.config.js.backup', 'app.config.js');
      fs.unlinkSync('app.config.js.backup');
    }
  }
}

// Get all source files
function getSourceFiles() {
  const sourceFiles = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  const excludeDirs = ['node_modules', '.expo', 'dist', '.git'];
  
  function scanDir(dir) {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !excludeDirs.includes(item)) {
          scanDir(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item))) {
          sourceFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scanDir('./app');
  return sourceFiles;
}

// Test with specific files
function testWithFiles(files) {
  console.log(\`🧪 Testing with \${files.length} files...\`);
  
  try {
    execSync('npx expo export:web', { stdio: 'inherit' });
    console.log('✅ Build succeeded!');
    return true;
  } catch (error) {
    console.log('❌ Build failed:', error.message);
    return false;
  }
}

// Binary search to find problematic file
function findProblematicFile(files) {
  if (files.length <= 1) {
    return files[0] || null;
  }
  
  const mid = Math.floor(files.length / 2);
  const firstHalf = files.slice(0, mid);
  const secondHalf = files.slice(mid);
  
  console.log(\`🔍 Testing first half (\${firstHalf.length} files)...\`);
  
  // Temporarily move second half
  const tempDir = './temp_files';
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  secondHalf.forEach(file => {
    const tempPath = path.join(tempDir, path.basename(file));
    fs.copyFileSync(file, tempPath);
    fs.unlinkSync(file);
  });
  
  const firstHalfWorks = testWithFiles(firstHalf);
  
  // Restore second half
  secondHalf.forEach(file => {
    const tempPath = path.join(tempDir, path.basename(file));
    fs.copyFileSync(tempPath, file);
    fs.unlinkSync(tempPath);
  });
  
  if (firstHalfWorks) {
    console.log('🎯 Problem is in second half');
    return findProblematicFile(secondHalf);
  } else {
    console.log('🎯 Problem is in first half');
    return findProblematicFile(firstHalf);
  }
}

// Main function
function main() {
  console.log('🚀 Starting build debugging...');
  
  // Test 1: Minimal build
  if (!testMinimalBuild()) {
    console.log('❌ Even minimal build fails. Issue might be with dependencies or system.');
    return;
  }
  
  // Test 2: Get all source files
  const sourceFiles = getSourceFiles();
  console.log(\`📁 Found \${sourceFiles.length} source files\`);
  
  // Test 3: Binary search for problematic file
  const problematicFile = findProblematicFile(sourceFiles);
  
  if (problematicFile) {
    console.log(\`🎯 Problematic file found: \${problematicFile}\`);
  } else {
    console.log('🤔 No specific problematic file found');
  }
}

if (require.main === module) {
  main();
}
