#!/usr/bin/env node

/**
 * Firebase Cleanup Script
 * 
 * This script verifies that all Firebase-related code and dependencies
 * have been completely removed from the project
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Firebase Cleanup Verification');
console.log('=' .repeat(50));

// Check for Firebase dependencies in package.json
function checkPackageJson() {
  console.log('\n📦 Checking package.json for Firebase dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    const firebaseDeps = Object.keys(allDeps).filter(dep => 
      dep.includes('firebase') || dep.includes('firestore')
    );
    
    if (firebaseDeps.length === 0) {
      console.log('✅ No Firebase dependencies found in package.json');
    } else {
      console.log('❌ Firebase dependencies still found:');
      firebaseDeps.forEach(dep => console.log(`  - ${dep}: ${allDeps[dep]}`));
    }
    
    return firebaseDeps.length === 0;
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
    return false;
  }
}

// Check for Firebase imports in source files
function checkSourceFiles() {
  console.log('\n📁 Checking source files for Firebase imports...');
  
  const firebasePatterns = [
    /import.*firebase/i,
    /import.*firestore/i,
    /from.*firebase/i,
    /from.*firestore/i,
    /require.*firebase/i,
    /require.*firestore/i
  ];
  
  const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build'];
  
  let foundFiles = [];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !excludeDirs.includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && sourceExtensions.includes(path.extname(item))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          for (const pattern of firebasePatterns) {
            if (pattern.test(content)) {
              foundFiles.push({
                file: fullPath,
                pattern: pattern.toString()
              });
              break;
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scanDirectory('./app');
  
  if (foundFiles.length === 0) {
    console.log('✅ No Firebase imports found in source files');
  } else {
    console.log('❌ Firebase imports still found:');
    foundFiles.forEach(({ file, pattern }) => {
      console.log(`  - ${file} (matches ${pattern})`);
    });
  }
  
  return foundFiles.length === 0;
}

// Check for Firebase configuration files
function checkConfigFiles() {
  console.log('\n⚙️ Checking for Firebase configuration files...');
  
  const firebaseFiles = [
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json',
    '.firebaserc',
    'firebase-debug.log'
  ];
  
  let foundFiles = [];
  
  for (const file of firebaseFiles) {
    if (fs.existsSync(file)) {
      foundFiles.push(file);
    }
  }
  
  if (foundFiles.length === 0) {
    console.log('✅ No Firebase configuration files found');
  } else {
    console.log('❌ Firebase configuration files still found:');
    foundFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  return foundFiles.length === 0;
}

// Check environment files for Firebase variables
function checkEnvironmentFiles() {
  console.log('\n🌍 Checking environment files for Firebase variables...');
  
  const envFiles = ['.env', '.env.example', '.env.local', '.env.development', '.env.staging', '.env.production'];
  const firebaseVarPattern = /FIREBASE_/i;
  
  let foundVars = [];
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (firebaseVarPattern.test(line) && !line.trim().startsWith('#')) {
            foundVars.push({
              file: envFile,
              line: index + 1,
              content: line.trim()
            });
          }
        });
      } catch (error) {
        console.log(`⚠️ Could not read ${envFile}: ${error.message}`);
      }
    }
  }
  
  if (foundVars.length === 0) {
    console.log('✅ No Firebase environment variables found');
  } else {
    console.log('❌ Firebase environment variables still found:');
    foundVars.forEach(({ file, line, content }) => {
      console.log(`  - ${file}:${line} - ${content}`);
    });
  }
  
  return foundVars.length === 0;
}

// Check app.config.js for Firebase references
function checkAppConfig() {
  console.log('\n📱 Checking app.config.js for Firebase references...');
  
  if (!fs.existsSync('app.config.js')) {
    console.log('✅ app.config.js not found (or already clean)');
    return true;
  }
  
  try {
    const content = fs.readFileSync('app.config.js', 'utf8');
    const firebasePattern = /FIREBASE_/i;
    
    if (firebasePattern.test(content)) {
      console.log('❌ Firebase references found in app.config.js');
      return false;
    } else {
      console.log('✅ No Firebase references found in app.config.js');
      return true;
    }
  } catch (error) {
    console.log('❌ Error reading app.config.js:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  const checks = [
    { name: 'Package Dependencies', fn: checkPackageJson },
    { name: 'Source Files', fn: checkSourceFiles },
    { name: 'Configuration Files', fn: checkConfigFiles },
    { name: 'Environment Variables', fn: checkEnvironmentFiles },
    { name: 'App Configuration', fn: checkAppConfig }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const passed = check.fn();
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('=' .repeat(30));
  
  if (allPassed) {
    console.log('🎉 All Firebase cleanup checks passed!');
    console.log('✅ Firebase has been completely removed from the project');
    console.log('\n🚀 The project is now using:');
    console.log('  - FastAPI backend with REST API');
    console.log('  - JWT-based authentication');
    console.log('  - PostgreSQL database');
    console.log('  - Environment-based configuration');
  } else {
    console.log('⚠️ Some Firebase references still remain');
    console.log('Please review the issues above and clean them up manually');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Run: npm install (to clean up node_modules)');
  console.log('2. Test the app to ensure everything works');
  console.log('3. Update any remaining documentation');
}

main().catch(console.error);
